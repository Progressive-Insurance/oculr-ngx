import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule, NgZone } from '@angular/core';

import { EventLoggerService } from './destinations/event-logger/event-logger.service';
import { createGoogleTagManagerService } from './destinations/google-tag-manager/create-google-tag-manager.service';
import {
  GOOGLE_TAG_MANAGER_STATE_TOKEN,
  GOOGLE_TAG_MANAGER_TRANSFORM_TOKEN,
  GoogleTagManagerService,
} from './destinations/google-tag-manager/google-tag-manager.service';
import { createSplunkAnalyticsService } from './destinations/splunk-analytics/create-splunk-analytics-service';
import {
  SPLUNK_ANALYTICS_SERVICE_STATE_TOKEN,
  SPLUNK_ANALYTICS_TRANSFORM_TOKEN,
  splunkAnalyticsApiKey,
  splunkAnalyticsEndpoint,
  SplunkAnalyticsService,
} from './destinations/splunk-analytics/splunk-analytics.service';
import { createSplunkStandardLoggingService } from './destinations/splunk-standard-logging/create-splunk-standard-logging-service';
import {
  SPLUNK_STANDARD_LOGGING_SERVICE_STATE_TOKEN,
  SPLUNK_STANDARD_LOGGING_TRANSFORM_TOKEN,
  splunkStandardLoggingApiKey,
  splunkStandardLoggingEndpoint,
  SplunkStandardLoggingService,
} from './destinations/splunk-standard-logging/splunk-standard-logging.service';
import { ButtonDirective } from './directives/button-interaction.directive';
import { DisplayDirective } from './directives/display.directive';
import { AnalyticsInterceptor } from './interceptors/analytics.interceptor';
import { StateProvider } from './models/state-provider.type';
import { StringSelector } from './models/string-selector.interface';
import { Transform } from './models/transform.interface';
import { AnalyticsEventBusService } from './services/analytics-event-bus.service';
import { EventDispatchService } from './services/event-dispatch.service';
import { LocationTrackingService } from './services/location-tracking.service';
import { TimeService } from './services/time.service';
import { WindowService } from './services/window.service';

@NgModule({
  imports: [CommonModule],
  declarations: [DisplayDirective, ButtonDirective],
  exports: [DisplayDirective, ButtonDirective],
  providers: [],
})
export class MonocleAngularModule {
  static forRoot(): ModuleWithProviders<MonocleAngularModule> {
    return {
      ngModule: MonocleAngularModule,
      providers: [
        AnalyticsEventBusService,
        EventDispatchService,
        EventLoggerService,
        LocationTrackingService,
        WindowService,
        TimeService,
        {
          provide: Window,
          useValue: window,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AnalyticsInterceptor,
          multi: true,
        },
      ],
    };
  }

  static forApp(): ModuleWithProviders<MonocleAngularModule> {
    return {
      ngModule: MonocleAngularModule,
      providers: [
        AnalyticsEventBusService,
        EventDispatchService,
        EventLoggerService,
        LocationTrackingService,
        WindowService,
        TimeService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AnalyticsInterceptor,
          multi: true,
        },
      ],
    };
  }

  static forFeature(): ModuleWithProviders<MonocleAngularModule> {
    return {
      ngModule: MonocleAngularModule,
    };
  }

  static forSplunkAnalyticsService(
    transform: Transform,
    state$: StateProvider,
    getEndpoint: StringSelector,
    getApiKey: StringSelector
  ): ModuleWithProviders<MonocleAngularModule> {
    return {
      ngModule: MonocleAngularModule,
      providers: [
        { provide: splunkAnalyticsEndpoint, useValue: getEndpoint },
        { provide: splunkAnalyticsApiKey, useValue: getApiKey },
        { provide: SPLUNK_ANALYTICS_TRANSFORM_TOKEN, useValue: transform },
        { provide: SPLUNK_ANALYTICS_SERVICE_STATE_TOKEN, useValue: state$ },
        {
          provide: SplunkAnalyticsService,
          useFactory: createSplunkAnalyticsService,
          deps: [
            HttpClient,
            NgZone,
            AnalyticsEventBusService,
            EventDispatchService,
            splunkAnalyticsEndpoint,
            splunkAnalyticsApiKey,
            SPLUNK_ANALYTICS_TRANSFORM_TOKEN,
            SPLUNK_ANALYTICS_SERVICE_STATE_TOKEN,
          ],
        },
      ],
    };
  }

  static forSplunkStandardLoggingService(
    transform: Transform,
    state$: StateProvider,
    getEndpoint: StringSelector,
    getApiKey: StringSelector
  ): ModuleWithProviders<MonocleAngularModule> {
    return {
      ngModule: MonocleAngularModule,
      providers: [
        { provide: splunkStandardLoggingEndpoint, useValue: getEndpoint },
        { provide: splunkStandardLoggingApiKey, useValue: getApiKey },
        { provide: SPLUNK_STANDARD_LOGGING_TRANSFORM_TOKEN, useValue: transform },
        { provide: SPLUNK_STANDARD_LOGGING_SERVICE_STATE_TOKEN, useValue: state$ },
        {
          provide: SplunkStandardLoggingService,
          useFactory: createSplunkStandardLoggingService,
          deps: [
            HttpClient,
            NgZone,
            AnalyticsEventBusService,
            EventDispatchService,
            splunkStandardLoggingEndpoint,
            splunkStandardLoggingApiKey,
            SPLUNK_STANDARD_LOGGING_TRANSFORM_TOKEN,
            SPLUNK_STANDARD_LOGGING_SERVICE_STATE_TOKEN,
          ],
        },
      ],
    };
  }

  static forGoogleTagManager(transform: Transform, state$: StateProvider): ModuleWithProviders<MonocleAngularModule> {
    return {
      ngModule: MonocleAngularModule,
      providers: [
        { provide: GOOGLE_TAG_MANAGER_TRANSFORM_TOKEN, useValue: transform },
        { provide: GOOGLE_TAG_MANAGER_STATE_TOKEN, useValue: state$ },
        {
          provide: GoogleTagManagerService,
          useFactory: createGoogleTagManagerService,
          deps: [
            WindowService,
            AnalyticsEventBusService,
            EventDispatchService,
            GOOGLE_TAG_MANAGER_STATE_TOKEN,
            GOOGLE_TAG_MANAGER_TRANSFORM_TOKEN,
          ],
        },
      ],
    };
  }
}
