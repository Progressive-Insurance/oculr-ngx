import { ApiActionMeta } from '../models/api-action-meta.interface';
import { ApiStartActionMeta } from '../models/api-start-action-meta.interface';
import { InteractionEventPayload } from '../models/interaction-event-payload.interface';
import { UpdateLocationPayload } from '../models/update-location-payload.interface';
import { EventPayload } from '../models/event-payload.interface';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';
import { ErrorReport } from '../models/actions/error-report.interface';
import { InteractionAction } from '../models/actions/interaction-action.interface';
import { TrackErrorAction } from '../models/actions/track-error-action.interface';
import { AnalyticsGenericAction } from '../models/actions/analytics-generic-action.interface';
import { AnalyticsApiAction } from '../models/actions/analytics-api-action.interface';
import { AnalyticsErrorAction } from '../models/actions/analytics-error-action.interface';
import { UpdateLocationAction } from '../models/actions/update-location-action.interface';
import { EVENT_TYPES } from '../event-types';

/**
 * @deprecated Use interactionEvent for Analytics 2.0
 */
export function trackInteractionEvent(eventDetails: InteractionEventPayload): InteractionAction {
  return {
    type: AnalyticsAction.INTERACTION_EVENT,
    payload: eventDetails,
    meta: {
      trackAs: EVENT_TYPES.interaction
    }
  };
}

/**
 * [Analytics 2.0] Create a Page View Event
 * @param payload Event Model and Event Location for this event
 */
export function pageViewEvent(payload: EventPayload): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.PAGE_VIEW_EVENT,
    payload
  };
}

/**
 * [Analytics 2.0] Create an Interaction Event
 * @param payload Event Model and Event Location for this event
 */
export function interactionEvent(payload: EventPayload): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.INTERACTION_EVENT,
    payload
  };
}

/**
 * [Analytics 2.0] Create a App Init Event
 */
export function appInit(payload: EventPayload): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.APP_INIT,
    payload
  };
}

/**
 * [Analytics 2.0] Create an App Error Event
 * @param payload Error and Event Location for this event
 */
export function appError(payload: EventPayload, meta: { error: Error | string }): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.APP_ERROR,
    payload,
    meta
  };
}

/**
 * [Analytics 2.0] Create a Display Event
 * @param payload Event Model and Event Location for this event
 */
export function displayEvent(payload: EventPayload): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.DISPLAY_EVENT,
    payload
  };
}

/**
 * [Analytics 2.0] Create a System Event
 * @param payload Event Model and Event Location for this event
 */
export function systemEvent(payload: EventPayload): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.SYSTEM_EVENT,
    payload
  };
}

/**
 * [Analytics 2.0] Create a Validation Error Event
 * @param payload Event Model and Event Location for this event
 */
export function validationErrorEvent(payload: EventPayload): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.VALIDATION_ERROR_EVENT,
    payload
  };
}

/**
 * [Analytics 2.0] Create an API Start Event
 * @param payload Event Model and Event Location for this event
 */
export function apiStartEvent(payload: EventPayload, meta: ApiStartActionMeta): AnalyticsApiAction {
  return {
    type: AnalyticsAction.API_START_EVENT,
    payload,
    meta
  };
}

/**
 * [Analytics 2.0] Create an API Success Event
 * @param payload Event Model and Event Location for this event
 * @param meta Additional run time information for the event
 */
export function apiSuccessEvent(payload: EventPayload, meta: ApiActionMeta): AnalyticsApiAction {
  return {
    type: AnalyticsAction.API_SUCCESS_EVENT,
    payload,
    meta
  };
}

/**
 * [Analytics 2.0] Create an API Success Event
 * @param payload Event Model and Event Location for this event
 * @param meta Additional run time information for the event
 */
export function apiFailureEvent(payload: EventPayload, meta: ApiActionMeta): AnalyticsApiAction {
  return {
    type: AnalyticsAction.API_FAILURE_EVENT,
    payload,
    meta
  };
}

/**
 * [Analytics 2.0] Create an API Complete Event
 * @param payload Event Model and Event Location for this event
 * @param meta Additional run time information for the event
 */
export function apiCompleteEvent(payload: EventPayload, meta: ApiActionMeta): AnalyticsApiAction {
  return {
    type: AnalyticsAction.API_COMPLETE_EVENT,
    payload,
    meta
  };
}

/**
 * @deprecated Use analyticsError for errors that need passed up to application
 */
export function trackError(errorObject: ErrorReport): TrackErrorAction {
  const errorReport: ErrorReport = {
    errorMessage: errorObject.errorMessage || '',
    errorCode: errorObject.errorCode || '',
    errorDetail: errorObject.errorDetail || '',
    logLevel: 'Error'
  };

  return {
    type: AnalyticsAction.TRACK_ERROR,
    payload: errorReport,
    meta: {
      trackAs: EVENT_TYPES.error
    }
  };
}

/**
 * [Analytics 1.0/2.0] Create an Analytics Error Event
 * @param error Error object caught in try...catch block
 */
export function analyticsError(error: any): AnalyticsErrorAction {
  return {
    type: AnalyticsAction.ANALYTICS_ERROR,
    payload: {
      error
    }
  };
}

/**
 * @deprecated Use pageViewEvent for Analytics 2.0
 * @param updateLocationPayload new route's location fields
 * @param shouldTrack `true` for Analytics 1.0, `false` for Analytics 2.0 during 1.0 -> 2.0 conversion
 */
export function updateLocation(updateLocationPayload: UpdateLocationPayload, shouldTrack: boolean): UpdateLocationAction {
  return {
    type: AnalyticsAction.UPDATE_LOCATION,
    payload: updateLocationPayload,
    meta: {
      track: shouldTrack
    }
  };
}
