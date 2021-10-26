import { ApiActionMeta } from '../models/api-action-meta.interface';
import { ApiStartActionMeta } from '../models/api-start-action-meta.interface';
import { EventPayload } from '../models/event-payload.interface';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';
import { AnalyticsGenericAction } from '../models/actions/analytics-generic-action.interface';
import { AnalyticsApiAction } from '../models/actions/analytics-api-action.interface';
import { AnalyticsErrorAction } from '../models/actions/analytics-error-action.interface';

/**
 * [Analytics 2.0] Create a Page View Event
 * @param payload Event Model and Event Location for this event
 */
export function pageViewEvent(payload: EventPayload): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.PAGE_VIEW_EVENT,
    payload,
  };
}

/**
 * [Analytics 2.0] Create an Interaction Event
 * @param payload Event Model and Event Location for this event
 */
export function interactionEvent(payload: EventPayload): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.INTERACTION_EVENT,
    payload,
  };
}

/**
 * [Analytics 2.0] Create a App Init Event
 */
export function appInit(payload: EventPayload): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.APP_INIT,
    payload,
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
    meta,
  };
}

/**
 * [Analytics 2.0] Create a System Event
 * @param payload Event Model and Event Location for this event
 */
export function systemEvent(payload: EventPayload): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.SYSTEM_EVENT,
    payload,
  };
}

/**
 * [Analytics 2.0] Create a Validation Error Event
 * @param payload Event Model and Event Location for this event
 */
export function validationErrorEvent(payload: EventPayload): AnalyticsGenericAction {
  return {
    type: AnalyticsAction.VALIDATION_ERROR_EVENT,
    payload,
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
    meta,
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
    meta,
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
    meta,
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
    meta,
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
      error,
    },
  };
}
