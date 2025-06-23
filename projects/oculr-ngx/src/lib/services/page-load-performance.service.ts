/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable, first, take } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { AppConfiguration } from '../models/app-configuration.interface';
import { createAnalyticEvent } from '../models/create-analytic-event';
import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { DispatchService } from './dispatch.service';

@Injectable({ providedIn: 'root' })
export class PageLoadPerformanceService {
  context$!: Observable<unknown> | Observable<unknown>[];
  focused!: number;
  blurred!: number;
  private _includeFocusUnfocusLogs: boolean = false;
  private _config!: AppConfiguration;

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
      document.hasFocus()
        ? (this.focused = Date.now())
        : (this.blurred = Date.now());
      // Log for Every Blur Event on Window. Indicates Time User was Focused on Window/App
      this.nativeWindow.onblur = () => {
        this.blurred = Date.now();
        this.dispatchService.trackPageView(
           createAnalyticEvent({
            label: `${this._config.applicationName} - Focused Time`,
            value: `${this.blurred && this.focused ? this.blurred - this.focused : 0}`,
            eventType: AnalyticEventType.PAGE_VIEW_EVENT
          }),
        );
      };

      // Log for Every Focus Event on Window. Indicates Time User was Unfocused on Window/App
      this.nativeWindow.onfocus = () => {
        this.focused = Date.now();
        this.dispatchService.trackPageView(
           createAnalyticEvent({
            label: `${this._config.applicationName} - Unfocused Time`,
            value: `${this.blurred && this.focused ? this.blurred - this.focused : 0}`,
            eventType: AnalyticEventType.PAGE_VIEW_EVENT
          }),
        );
      };
    }
  }
  get nativeWindow(): Window {
    return window as Window;
  }
}

