/* 
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/ 
 
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { AppConfiguration } from '../models/app-configuration.interface';
import { createAnalyticEvent } from '../models/create-analytic-event';
import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { DispatchService } from './dispatch.service';

@Injectable({ providedIn: 'root' })
export class PageLoadPerformanceService implements OnDestroy {
  context$!: Observable<unknown> | Observable<unknown>[];
  focused!: number;
  blurred!: number;
  private _includeFocusUnfocusLogs: boolean = false;
  private _config!: AppConfiguration;
  private _configSubscription: Subscription | undefined;
  private _blurListener: (() => void) | undefined;
  private _focusListener: (() => void) | undefined;

  constructor(
    private dispatchService: DispatchService,
    private configService: ConfigurationService,
  ) {
    // Track the latest emitted configuration so events always use the current
    // application name, regardless of when the consumer loads configuration.
    this._configSubscription = this.configService.appConfig$.subscribe(
      (value: AppConfiguration) => (this._config = value),
    );
  }

  ngOnDestroy(): void {
    this._configSubscription?.unsubscribe();
    this._configSubscription = undefined;
    this.removeFocusListeners();
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
      // Refresh the timing baseline from the current focus state so that time
      // spent while disabled does not leak into the next enabled interval.
      if (document.hasFocus()) {
        this.focused = Date.now();
      } else {
        this.blurred = Date.now();
      }
      this.installFocusListeners();
    } else {
      this.removeFocusListeners();
    }
  }

  // Register service-owned blur/focus listeners without taking ownership of the
  // host application's onblur/onfocus properties. Idempotent: repeated calls
  // leave exactly one listener per transition.
  private installFocusListeners(): void {
    this.removeFocusListeners();

    // Log for Every Blur Event on Window. Indicates Time User was Focused on Window/App
    this._blurListener = () => {
      this.blurred = Date.now();
      this.dispatchService.trackPageView(
        createAnalyticEvent({
          label: `${this._config.applicationName} - Focused Time`,
          value: `${
            this.blurred !== undefined && this.focused !== undefined
              ? this.blurred - this.focused
              : 0
          }`,
          eventType: AnalyticEventType.PAGE_VIEW_EVENT
        }),
      );
    };

    // Log for Every Focus Event on Window. Indicates Time User was Unfocused on Window/App
    this._focusListener = () => {
      this.focused = Date.now();
      this.dispatchService.trackPageView(
        createAnalyticEvent({
          label: `${this._config.applicationName} - Unfocused Time`,
          value: `${
            this.focused !== undefined && this.blurred !== undefined
              ? this.focused - this.blurred
              : 0
          }`,
          eventType: AnalyticEventType.PAGE_VIEW_EVENT
        }),
      );
    };

    this.nativeWindow.addEventListener('blur', this._blurListener);
    this.nativeWindow.addEventListener('focus', this._focusListener);
  }

  // Remove this service's blur/focus listeners, if any. Safe to call repeatedly.
  private removeFocusListeners(): void {
    if (this._blurListener) {
      this.nativeWindow.removeEventListener('blur', this._blurListener);
      this._blurListener = undefined;
    }
    if (this._focusListener) {
      this.nativeWindow.removeEventListener('focus', this._focusListener);
      this._focusListener = undefined;
    }
  }
  get nativeWindow(): Window {
    return window;
  }
}

