export { MonocleAngularModule } from './lib/monocle-ngx.module';
// TODO: look to remove/may already be deprecated, maybe replace with issue to be worked on later for a runtime ignore feature
export { EVENT_IGNORE } from './lib/event-constants';
// TODO: export an interface export { getEmptyEventModel } from './lib/interceptors/constants';

// TODO: configurable service (api calls), e.g. Splunk, Google Tag. Don't expose service that does calls, handled by lib
// TODO: have default services for Splunk and Google
// TODO: don't want to hook into state management, observable providers?
export { GoogleTagManagerService } from './lib/destinations/google-tag-manager/google-tag-manager.service';
export { SplunkAnalyticsService } from './lib/destinations/splunk-analytics/splunk-analytics.service';
export { SplunkStandardLoggingService } from './lib/destinations/splunk-standard-logging/splunk-standard-logging.service';

// TODO: remove the old modal directive that is deprecated, still needed to handle modals as pages
export { DisplayDirective } from './lib/directives/display.directive';
export { InteractionEventDirective } from './lib/directives/interaction-event.directive';
export { ModalDirective } from './lib/directives/modal.directive';

// TODO: to review expose, lean towards interfaces
export { AnalyticsEventModel } from './lib/models/analytics-event-model.interface';
export { AnalyticsEventDetailsModel } from './lib/models/analytics-event-details-model.interface';
export { AnalyticsHttpParams } from './lib/models/analytics-http-params.class';
export { ApiActionMeta } from './lib/models/api-action-meta.interface';
export { ApiAnalyticsModels } from './lib/models/api-analytics-models.interface';
export { ApiFinishedPayload } from './lib/models/actions/api-finished-payload.interface';
export { ApiStartedPayload } from './lib/models/actions/api-started-payload.interface';
export { EventModel } from './lib/models/event-model.class';
export { EventPayload } from './lib/models/event-payload.interface';
export { HttpDispatchRequestOptions } from './lib/models/http-dispatch-request-options.interface';
export { UpdateLocationPayload } from './lib/models/update-location-payload.interface';
export { TrackInteractionPayload } from './lib/models/track-interaction-payload.interface';
export { AnalyticsApiAction } from './lib/models/actions/analytics-api-action.interface';
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
export { GetFromResponseInterface } from './lib/models/get-from-response.interface';
export { CommonErrorSchema } from './lib/models/common-error-schema.model';
export { StandardAction } from './lib/models/actions/standard-action.interface';

export { AnalyticsService } from './lib/services/analytics.service';
export { AnalyticsEventBusService } from './lib/services/analytics-event-bus.service';
export { EventDispatchService } from './lib/services/event-dispatch.service';
export { EventLoggerService } from './lib/destinations/event-logger/event-logger.service';
export { HttpDispatchService } from './lib/services/http-dispatch.service';
export { LocationTrackingService } from './lib/services/location-tracking.service';
// TODO: This may or may not need to be exposed. Leaving here for now to match existing exposure.
export { FormattingService } from './lib/services/formatting.service';
