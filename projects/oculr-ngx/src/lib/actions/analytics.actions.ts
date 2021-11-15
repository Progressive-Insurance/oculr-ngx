import { AnalyticsAction } from '../models/actions/analytics-action.enum';
import { AnalyticsErrorAction } from '../models/actions/analytics-error-action.interface';
import { AnalyticsGenericAction } from '../models/actions/analytics-generic-action.interface';
import { EventPayload } from '../models/event-payload.interface';

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
 * [Analytics 1.0/2.0] Create an Analytics Error Event
 * @param error Error object caught in try...catch block
 */
export function analyticsError(error: unknown): AnalyticsErrorAction {
  return {
    type: AnalyticsAction.ANALYTICS_ERROR,
    payload: {
      error,
    },
  };
}
