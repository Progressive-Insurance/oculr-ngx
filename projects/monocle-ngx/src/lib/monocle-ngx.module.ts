import { CommonModule } from '@angular/common';
import { InjectionToken, ModuleWithProviders, NgModule, NgZone, APP_INITIALIZER, Injector } from '@angular/core';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AnalyticsService } from './services/analytics.service';
import { LocationTrackingService } from './services/location-tracking.service';
import { HttpDispatchService } from './services/http-dispatch.service';
import { EventIdErrorDirective } from './directives/event-id-error.directive';
import { EventIdDirective } from './directives/event-id.directive';
import { DisplayEventDirective } from './directives/display-event.directive';
import { InteractionEventDirective } from './directives/interaction-event.directive';
import { ModalDirective } from './directives/modal.directive';
import { ModalPageViewDirective } from './directives/modal-page-view.directive';
import { AnalyticsInterceptor } from './interceptors/analytics.interceptor';
import { AnalyticsEventModelMap } from './models/analytics-event-model-map.interface';
import { StringSelector } from './models/string-selector.interface';
import { Transform } from './models/transform.interface';
import { ANALYTICS_EVENT_MODEL_MAPS, ANALYTICS_ERROR_MODEL_ID, AnalyticsEventModelsService } from './services/analytics-event-models.service';
import { EventDispatchService } from './services/event-dispatch.service';
import { RouterDispatchService } from './services/router-dispatch.service';
import { WindowService } from './utils/window.service';
import {
  GoogleTagManagerService,
  GOOGLE_TAG_MANAGER_TRANSFORM_TOKEN,
  GOOGLE_TAG_MANAGER_STATE_TOKEN
} from './destinations/google-tag-manager/google-tag-manager.service';
import { AnalyticsEventBusService } from './services/analytics-event-bus.service';
import { StateProvider } from './models/state-provider.type';
import { createGoogleTagManagerService } from './destinations/google-tag-manager/create-google-tag-manager.service';
import {
  SplunkAnalyticsService,
  splunkAnalyticsEndpoint,
  splunkAnalyticsApiKey,
  SPLUNK_ANALYTICS_TRANSFORM_TOKEN,
  SPLUNK_ANALYTICS_SERVICE_STATE_TOKEN
} from './destinations/splunk-analytics/splunk-analytics.service';
import { createSplunkAnalyticsService } from './destinations/splunk-analytics/create-splunk-analytics-service';
import {
  SplunkStandardLoggingService,
  splunkStandardLoggingEndpoint,
  splunkStandardLoggingApiKey,
  SPLUNK_STANDARD_LOGGING_TRANSFORM_TOKEN,
  SPLUNK_STANDARD_LOGGING_SERVICE_STATE_TOKEN
} from './destinations/splunk-standard-logging/splunk-standard-logging.service';
import { createSplunkStandardLoggingService } from './destinations/splunk-standard-logging/create-splunk-standard-logging-service';
import { EventCacheService } from './services/event-cache.service';
import { EventLoggerService } from './destinations/event-logger/event-logger.service';
import { TimeService } from './services/time.service';

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
  declarations: [
    EventIdDirective,
    EventIdErrorDirective,
    DisplayEventDirective,
    InteractionEventDirective,
    ModalDirective,
    ModalPageViewDirective
  ],
  exports: [
    EventIdDirective,
    EventIdErrorDirective,
    DisplayEventDirective,
    InteractionEventDirective,
    ModalDirective,
    ModalPageViewDirective
  ],
  providers: []
})
export class AnalyticsLibraryModule {
  static forRoot(
    eventModelMaps: AnalyticsEventModelMap[],
    notFound: string
  ): ModuleWithProviders<AnalyticsLibraryModule> {
    return {
      ngModule: AnalyticsLibraryModule,
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
          deps: [Injector]
        },
        {
          provide: APP_INITIALIZER,
          multi: true,
          useExisting: ANALYTICS_BOOTSTRAP
        },
        {
          provide: ANALYTICS_EVENT_MODEL_MAPS,
          useValue: eventModelMaps,
          multi: true
        },
        {
          provide: ANALYTICS_ERROR_MODEL_ID,
          useValue: notFound,
          multi: false
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AnalyticsInterceptor,
          multi: true
        }
      ]
    };
  }

  static forChild(eventModelMaps: AnalyticsEventModelMap[]): ModuleWithProviders<AnalyticsLibraryModule> {
    return {
      ngModule: AnalyticsLibraryModule,
      providers: [
        AnalyticsEventModelsService,
        {
          provide: ANALYTICS_EVENT_MODEL_MAPS,
          useValue: eventModelMaps,
          multi: true
        }
      ]
    };
  }

  static forApp(): ModuleWithProviders<AnalyticsLibraryModule> {
    return {
      ngModule: AnalyticsLibraryModule,
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
          multi: true
        }
      ]
    };
  }

  static forFeature(): ModuleWithProviders<AnalyticsLibraryModule> {
    return {
      ngModule: AnalyticsLibraryModule
    };
  }

  static forSplunkAnalyticsService(
    transform: Transform,
    state$: StateProvider,
    getEndpoint: StringSelector,
    getApiKey: StringSelector
  ): ModuleWithProviders<AnalyticsLibraryModule> {
    return {
      ngModule: AnalyticsLibraryModule,
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
            SPLUNK_ANALYTICS_SERVICE_STATE_TOKEN
          ]
        }
      ]
    };
  }

  static forSplunkStandardLoggingService(
    transform: Transform,
    state$: StateProvider,
    getEndpoint: StringSelector,
    getApiKey: StringSelector
  ): ModuleWithProviders<AnalyticsLibraryModule> {
    return {
      ngModule: AnalyticsLibraryModule,
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
            SPLUNK_STANDARD_LOGGING_SERVICE_STATE_TOKEN
          ]
        }
      ]
    };
  }

  static forGoogleTagManager(transform: Transform, state$: StateProvider): ModuleWithProviders<AnalyticsLibraryModule> {
    return {
      ngModule: AnalyticsLibraryModule,
      providers: [
        { provide: GOOGLE_TAG_MANAGER_TRANSFORM_TOKEN, useValue: transform },
        { provide: GOOGLE_TAG_MANAGER_STATE_TOKEN, useValue: state$ },
        {
          provide: GoogleTagManagerService,
          useFactory: createGoogleTagManagerService,
          deps: [WindowService, AnalyticsEventBusService, EventDispatchService, GOOGLE_TAG_MANAGER_STATE_TOKEN, GOOGLE_TAG_MANAGER_TRANSFORM_TOKEN]
        }
      ]
    };
  }
}
