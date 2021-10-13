import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import {
  APP_INITIALIZER, InjectionToken, Injector, ModuleWithProviders, NgModule,
  NgZone
} from '@angular/core';

import { EventLoggerService } from './destinations/event-logger/event-logger.service';
import { createGoogleTagManagerService } from './destinations/google-tag-manager/create-google-tag-manager.service';
import { GOOGLE_TAG_MANAGER_STATE_TOKEN, GOOGLE_TAG_MANAGER_TRANSFORM_TOKEN, GoogleTagManagerService } from './destinations/google-tag-manager/google-tag-manager.service';
import { createSplunkAnalyticsService } from './destinations/splunk-analytics/create-splunk-analytics-service';
import { SPLUNK_ANALYTICS_SERVICE_STATE_TOKEN, SPLUNK_ANALYTICS_TRANSFORM_TOKEN, splunkAnalyticsApiKey, splunkAnalyticsEndpoint, SplunkAnalyticsService } from './destinations/splunk-analytics/splunk-analytics.service';
import { createSplunkStandardLoggingService } from './destinations/splunk-standard-logging/create-splunk-standard-logging-service';
import { SPLUNK_STANDARD_LOGGING_SERVICE_STATE_TOKEN, SPLUNK_STANDARD_LOGGING_TRANSFORM_TOKEN, splunkStandardLoggingApiKey, splunkStandardLoggingEndpoint, SplunkStandardLoggingService } from './destinations/splunk-standard-logging/splunk-standard-logging.service';
import { DisplayDirective } from './directives/display.directive';
import { InteractionEventDirective } from './directives/interaction-event.directive';
import { ModalDirective } from './directives/modal.directive';
import { AnalyticsInterceptor } from './interceptors/analytics.interceptor';
import { AnalyticsEventModelMap } from './models/analytics-event-model-map.interface';
import { StateProvider } from './models/state-provider.type';
import { StringSelector } from './models/string-selector.interface';
import { Transform } from './models/transform.interface';
import { AnalyticsEventBusService } from './services/analytics-event-bus.service';
import { ANALYTICS_ERROR_MODEL_ID, ANALYTICS_EVENT_MODEL_MAPS, AnalyticsEventModelsService } from './services/analytics-event-models.service';
import { AnalyticsService } from './services/analytics.service';
import { EventCacheService } from './services/event-cache.service';
import { EventDispatchService } from './services/event-dispatch.service';
import { HttpDispatchService } from './services/http-dispatch.service';
import { LocationTrackingService } from './services/location-tracking.service';
import { RouterDispatchService } from './services/router-dispatch.service';
import { TimeService } from './services/time.service';
import { WindowService } from './utils/window.service';

export const ANALYTICS_BOOTSTRAP = new InjectionToken<void>('Analytics Bootstrap');

export function provideAnalytics(injector: Injector) {
  const func = function () {
    const routerDispatchService = injector.get(RouterDispatchService);
    routerDispatchService.initialize();
  };
  return func;
}

@NgModule({
  imports: [CommonModule],
  declarations: [DisplayDirective, InteractionEventDirective, ModalDirective],
  exports: [DisplayDirective, InteractionEventDirective, ModalDirective],
  providers: [],
})
export class MonocleAngularModule {
  static forRoot(
    eventModelMaps: AnalyticsEventModelMap[],
    notFound: string
  ): ModuleWithProviders<MonocleAngularModule> {
    return {
      ngModule: MonocleAngularModule,
      providers: [
        AnalyticsEventBusService,
        EventDispatchService,
        EventCacheService,
        EventLoggerService,
        LocationTrackingService,
        WindowService,
        RouterDispatchService,
        HttpDispatchService,
        AnalyticsEventModelsService,
        AnalyticsService,
        TimeService,
        {
          provide: ANALYTICS_BOOTSTRAP,
          useFactory: provideAnalytics,
          deps: [Injector],
        },
        {
          provide: APP_INITIALIZER,
          multi: true,
          useExisting: ANALYTICS_BOOTSTRAP,
        },
        {
          provide: ANALYTICS_EVENT_MODEL_MAPS,
          useValue: eventModelMaps,
          multi: true,
        },
        {
          provide: ANALYTICS_ERROR_MODEL_ID,
          useValue: notFound,
          multi: false,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AnalyticsInterceptor,
          multi: true,
        },
      ],
    };
  }

  static forChild(eventModelMaps: AnalyticsEventModelMap[]): ModuleWithProviders<MonocleAngularModule> {
    return {
      ngModule: MonocleAngularModule,
      providers: [
        AnalyticsEventModelsService,
        {
          provide: ANALYTICS_EVENT_MODEL_MAPS,
          useValue: eventModelMaps,
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
        EventCacheService,
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
