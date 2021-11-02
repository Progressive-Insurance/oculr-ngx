export { MonocleAngularModule } from './lib/monocle-ngx.module';

// TODO: export an interface export { getEmptyEventModel } from './lib/interceptors/constants';

// TODO: configurable service (api calls), e.g. Splunk, Google Tag. Don't expose service that does calls, handled by lib
// TODO: have default services for Splunk and Google
// TODO: don't want to hook into state management, observable providers?
export { GoogleTagManagerService } from './lib/destinations/google-tag-manager/google-tag-manager.service';
export { SplunkAnalyticsService } from './lib/destinations/splunk-analytics/splunk-analytics.service';
export { SplunkStandardLoggingService } from './lib/destinations/splunk-standard-logging/splunk-standard-logging.service';

export { DisplayDirective } from './lib/directives/display.directive';
export { ClickDirective } from './lib/directives/click.directive';

export { API_EVENT_CONTEXT } from './lib/interceptors/analytics.interceptor';

export { AnalyticEvent } from './lib/models/analytic-event.interface';
export { ApiContext } from './lib/models/api-context.interface';
export { ApiEventContext } from './lib/models/api-event-context.interface';
// TODO: to review expose, lean towards interfaces
export { EventModel } from './lib/models/event-model.class';
export { EventPayload } from './lib/models/event-payload.interface';
export { AnalyticsErrorAction } from './lib/models/actions/analytics-error-action.interface';
export { AnalyticsGenericAction } from './lib/models/actions/analytics-generic-action.interface';
export { SplunkBasePayload } from './lib/models/destinations/splunk-base-payload.interface';
export { SplunkEventData } from './lib/models/destinations/splunk-event-data.interface';
export { SplunkEventPayload } from './lib/models/destinations/splunk-event-payload.interface';
export { SplunkPagePayload } from './lib/models/destinations/splunk-page-payload.interface';
export { Transform } from './lib/models/transform.interface';
export { AnalyticsAction } from './lib/models/actions/analytics-action.enum';
export { EventExtras } from './lib/models/event-extras.interface';
export { JwtToken } from './lib/models/jwt-token.interface';
export { CommonErrorSchema } from './lib/models/common-error-schema.model';
export { StandardAction } from './lib/models/actions/standard-action.interface';

export { AnalyticsEventBusService } from './lib/services/analytics-event-bus.service';
export { EventDispatchService } from './lib/services/event-dispatch.service';
export { EventLoggerService } from './lib/destinations/event-logger/event-logger.service';
export { LocationTrackingService } from './lib/services/location-tracking.service';
// TODO: This may or may not need to be exposed. Leaving here for now to match existing exposure.
export { FormattingService } from './lib/services/formatting.service';
