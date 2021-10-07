// TODO: remove export of bootstrap and provideAnalytics
export { MonocleAngularModule, ANALYTICS_BOOTSTRAP, provideAnalytics } from './lib/monocle-ngx.module';
// TODO: look to remove/may already be deprecated, maybe replace with issue to be worked on later for a runtime ignore feature
export { EVENT_IGNORE } from './lib/event-constants';
// TODO: export an interface export { getEmptyEventModel } from './lib/interceptors/constants';

// TODO: configurable service (api calls), e.g. Splunk, Google Tag. Don't expose service that does calls, handled by lib
// TODO: have default services for Splunk and Google
// TODO: don't want to hook into state management, observable providers?
export {
  GOOGLE_TAG_MANAGER_STATE_TOKEN,
  GOOGLE_TAG_MANAGER_TRANSFORM_TOKEN,
  GoogleTagManagerService,
} from './lib/destinations/google-tag-manager/google-tag-manager.service';

export {
  SplunkAnalyticsService,
  SPLUNK_ANALYTICS_TRANSFORM_TOKEN,
  SPLUNK_ANALYTICS_SERVICE_STATE_TOKEN,
} from './lib/destinations/splunk-analytics/splunk-analytics.service';

export {
  SplunkStandardLoggingService,
  SPLUNK_STANDARD_LOGGING_TRANSFORM_TOKEN,
  SPLUNK_STANDARD_LOGGING_SERVICE_STATE_TOKEN,
} from './lib/destinations/splunk-standard-logging/splunk-standard-logging.service';

// TODO: remove the old modal directive that is deprecated, still needed to handle modals as pages
export { DisplayEventDirective } from './lib/directives/display-event.directive';
export { InteractionEventDirective } from './lib/directives/interaction-event.directive';
export { ModalDirective } from './lib/directives/modal.directive';
export { ModalPageViewDirective } from './lib/directives/modal-page-view.directive';

export { AnalyticsInterceptor } from './lib/interceptors/analytics.interceptor';

// TODO: to review expose, lean towards interfaces
export { AccessType } from './lib/models/access-type.type';
export { AccessMode } from './lib/models/access-mode.type';
export { AnalyticsEventModel } from './lib/models/analytics-event-model.interface';
export { AnalyticsEventDetailsModel } from './lib/models/analytics-event-details-model.interface';
export { AnalyticsEventModelMap } from './lib/models/analytics-event-model-map.interface';
export { AnalyticsHttpParams } from './lib/models/analytics-http-params.class';
export { AnalyticsHttpParamsOptions } from './lib/models/analytics-http-params-options.interface';
export { ApiActionMeta } from './lib/models/api-action-meta.interface';
export { ApiAnalyticsModels } from './lib/models/api-analytics-models.interface';
export { ApiFinishedPayload } from './lib/models/actions/api-finished-payload.interface';
export { ApiStartedPayload } from './lib/models/actions/api-started-payload.interface';
export { EventModel } from './lib/models/event-model.class';
export { EventLocation } from './lib/models/event-location.interface';
export { EventPayload } from './lib/models/event-payload.interface';
export { HitDate } from './lib/models/hit-date.type';
export { HttpDispatchRequest } from './lib/models/http-dispatch-request.interface';
export { HttpDispatchRequestOptions } from './lib/models/http-dispatch-request-options.interface';
export { InteractionEventPayload } from './lib/models/interaction-event-payload.interface';
export { Logger } from './lib/models/logger.type';
export { UpdateLocationPayload } from './lib/models/update-location-payload.interface';
export { VariableData } from './lib/models/variable-data.interface';
export { PixelArea } from './lib/models/pixel-area.type';
export { TrackInteractionPayload } from './lib/models/track-interaction-payload.interface';
export { AnalyticsApiAction } from './lib/models/actions/analytics-api-action.interface';
export { AnalyticsErrorAction } from './lib/models/actions/analytics-error-action.interface';
export { AnalyticsGenericAction } from './lib/models/actions/analytics-generic-action.interface';
export { GoogleTagManagerAppInitPayload } from './lib/models/destinations/google-tag-manager-app-init-payload.interface';
export { GoogleTagManagerBasePayload } from './lib/models/destinations/google-tag-manager-base-payload.interface';
export { GoogleTagManagerEvent } from './lib/models/destinations/google-tag-manager-event.type';
export { GoogleTagManagerEventPayload } from './lib/models/destinations/google-tag-manager-event-payload.type';
export { GoogleTagManagerPagePayload } from './lib/models/destinations/google-tag-manager-page-payload.interface';
export { SplunkBasePayload } from './lib/models/destinations/splunk-base-payload.interface';
export { SplunkEventData } from './lib/models/destinations/splunk-event-data.interface';
export { SplunkEventModelData } from './lib/models/destinations/splunk-event-model-data.interface';
export { SplunkEventPayload } from './lib/models/destinations/splunk-event-payload.interface';
export { SplunkPagePayload } from './lib/models/destinations/splunk-page-payload.interface';
export { StateProvider } from './lib/models/state-provider.type';
export { Transform } from './lib/models/transform.interface';
export { AnalyticsAction } from './lib/models/actions/analytics-action.enum';
export { StringSelector } from './lib/models/string-selector.interface';
export { EventExtras } from './lib/models/event-extras.interface';
export { LoginData } from './lib/models/login-data.interface';
export { JwtToken } from './lib/models/jwt-token.interface';
export { GetFromResponseInterface } from './lib/models/get-from-response.interface';
export { CommonErrorSchema } from './lib/models/common-error-schema.model';
export { StandardAction } from './lib/models/actions/standard-action.interface';

export {
  AnalyticsEventModelsService,
  ANALYTICS_ERROR_MODEL_ID,
  ANALYTICS_EVENT_MODEL_MAPS,
} from './lib/services/analytics-event-models.service';
export { AnalyticsService } from './lib/services/analytics.service';
export { AnalyticsEventBusService } from './lib/services/analytics-event-bus.service';
export { EventDispatchService } from './lib/services/event-dispatch.service';
export { EventLoggerService } from './lib/destinations/event-logger/event-logger.service';
export { HttpDispatchService } from './lib/services/http-dispatch.service';
export { RouterDispatchService } from './lib/services/router-dispatch.service';
export { LocationTrackingService } from './lib/services/location-tracking.service';

export { formatCifDate, formatDateWithTimezoneOffset } from './lib/utils/date-util';
export { decodeHtmlEntities } from './lib/utils/decode-html-entities';
export { formatFormErrors } from './lib/utils/format-form-errors';
export { getCheckboxState } from './lib/utils/get-checkbox-state';
export { getCookieDomain } from './lib/utils/get-cookie-domain';
export { getDataFromDecodedToken } from './lib/utils/get-data-from-decoded-token';
export { getInputLabel } from './lib/utils/get-input-label';
export { getSelectedOptions } from './lib/utils/get-selected-options';
export { hitDate } from './lib/utils/hit-date';
export { htmlToText } from './lib/utils/html-to-text';
export { removeHtmlEntities } from './lib/utils/remove-html-entities';
export { screenResolution } from './lib/utils/screen-resolution';
export { windowSize } from './lib/utils/window-size';
export { WindowService } from './lib/utils/window.service';

export { Validators } from './lib/validators/validators';
