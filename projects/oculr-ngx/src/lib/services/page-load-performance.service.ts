/* 
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/ 
 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, take } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { AppConfiguration } from '../models/app-configuration.interface';
import { createAnalyticEvent } from '../models/create-analytic-event';
import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { DispatchService } from './dispatch.service';

@Injectable()
export class PageLoadPerformanceService implements OnDestroy {
  context$!: Observable<unknown> | Observable<unknown>[];
  focused!: number;
  blurred!: number;
  private _includeFocusUnfocusLogs: boolean = false;
  private _config!: AppConfiguration;
  private _onBlurHandler: (() => void) | undefined;
  private _onFocusHandler: (() => void) | undefined;

  constructor(
    private dispatchService: DispatchService,
    private configService: ConfigurationService,
  ) {
    this.configService.appConfig$
      .pipe(take(1))
      .subscribe((value: AppConfiguration) => (this._config = value));
  }

  initialize(
    includeFocusUnfocusLogs: boolean = false,
  ): void {
    const pageLoadStartTime: number = (
      this.nativeWindow as Window & { pageLoadStartTime: number }
    ).pageLoadStartTime;
    this._includeFocusUnfocusLogs = includeFocusUnfocusLogs;

    // Log for Initial Page Load
    if (pageLoadStartTime) {
      this.dispatchService.trackPageView(
        createAnalyticEvent({
          label: `${this._config.applicationName} - ${
            document.hasFocus() ? 'Focused' : 'Unfocused'
          } App Initialization Complete`,
          value: `${Date.now() - pageLoadStartTime}`,
          eventType: AnalyticEventType.PAGE_VIEW_EVENT
        })
      );
    } else {
      console.error(
        'Error: PageLoadPerformanceService - No timestamp "pageLoadStartTime" found on window',
      );
    }

    // Only include logs if flag is passed in as true
    if (this._includeFocusUnfocusLogs) {
      // Set initial value for duration time
      if (document.hasFocus()) {
        this.focused = Date.now();
      } else {
        this.blurred = Date.now();
      }
      // Log for Every Blur Event on Window. Indicates Time User was Focused on Window/App.
      // Use addEventListener (not window.onblur) so we do not clobber any existing
      // focus/blur handlers the host application has registered.
      this._onBlurHandler = () => {
        this.blurred = Date.now();
        this.dispatchService.trackPageView(
           createAnalyticEvent({
            label: `${this._config.applicationName} - Focused Time`,
            value: `${this.blurred && this.focused ? this.blurred - this.focused : 0}`,
            eventType: AnalyticEventType.PAGE_VIEW_EVENT
          }),
        );
      };
      this.nativeWindow.addEventListener('blur', this._onBlurHandler);

      // Log for Every Focus Event on Window. Indicates Time User was Unfocused on Window/App.
      // The unfocused duration is the time between the previous blur and this focus,
      // i.e. focused - blurred (the previous code computed blurred - focused, which is
      // always negative).
      this._onFocusHandler = () => {
        this.focused = Date.now();
        this.dispatchService.trackPageView(
           createAnalyticEvent({
            label: `${this._config.applicationName} - Unfocused Time`,
            value: `${this.blurred && this.focused ? this.focused - this.blurred : 0}`,
            eventType: AnalyticEventType.PAGE_VIEW_EVENT
          }),
        );
      };
      this.nativeWindow.addEventListener('focus', this._onFocusHandler);
    }
  }

  ngOnDestroy(): void {
    if (this._onBlurHandler) {
      this.nativeWindow.removeEventListener('blur', this._onBlurHandler);
      this._onBlurHandler = undefined;
    }
    if (this._onFocusHandler) {
      this.nativeWindow.removeEventListener('focus', this._onFocusHandler);
      this._onFocusHandler = undefined;
    }
  }

  get nativeWindow(): Window {
    return window as Window;
  }
}

