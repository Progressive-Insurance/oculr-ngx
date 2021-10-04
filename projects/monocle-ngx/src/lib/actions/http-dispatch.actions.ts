import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

import { HttpDispatchRequestOptions } from '../models/http-dispatch-request-options.interface';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';
import { EventExtras } from '../models/event-extras.interface';
import { ApiCompletedAction } from '../models/actions/api-completed-action.interface';
import { ApiErrorAction } from '../models/actions/api-error-action.interface';
import { ApiFinishedPayload } from '../models/actions/api-finished-payload.interface';
import { ApiStartedAction } from '../models/actions/api-started-action.interface';
import { ApiSucceededAction } from '../models/actions/api-succeeded-action.interface';

const buildPayload = (response: HttpResponse<any> | HttpErrorResponse, eventId: string | undefined, eventExtras: EventExtras | undefined,
  requestStartTime: number, requestEndTime: number)
  : ApiFinishedPayload => {
  let customDimensions: any = {};

  if (eventExtras && eventExtras.customDimensions && typeof eventExtras.customDimensions === 'object') {
    customDimensions = Object.keys(eventExtras.customDimensions)
      .reduce((resultObj: any, currentField: string) => {
        resultObj[currentField] = (typeof eventExtras.customDimensions[currentField] === 'function'
          ? eventExtras.customDimensions[currentField](response)
          : eventExtras.customDimensions[currentField]);
        return resultObj;
      }, {});
  }

  return {
    response: response,
    url: response.url,
    id: eventId,
    ...eventExtras,
    customDimensions: {
      ...(eventExtras && eventExtras.customDimensions || {}),
      ...customDimensions
    },
    requestStartTime,
    requestEndTime,
    variableData: {
      ...(eventExtras && eventExtras.variableData || {}),
      duration: Math.round(requestEndTime - requestStartTime),
      statusCode: (typeof response.status === 'number' ? response.status.toString() : response.status)
    }
  };
};

const isErrorHandled = (isErrorCodeSuccess: { [id: string]: boolean } = {}, status: number) => {
  return isErrorCodeSuccess.hasOwnProperty(status) && isErrorCodeSuccess[status] === true;
};

/**
 * @deprecated Use AnalyticsInterceptor or EventDispatchService#trackApiStart for Analytics 2.0
 */
export const onStart = (options: HttpDispatchRequestOptions) => (requestStartTime: number, meta: any): ApiStartedAction => ({
  type: AnalyticsAction.API_STARTED,
  payload: {
    id: options.startId,
    requestStartTime,
    ...options.startEventExtras
  },
  meta
});

/**
 * @deprecated Use AnalyticsInterceptor or EventDispatchService#trackApiSuccess for Analytics 2.0
 */
export const onSuccess = (options: HttpDispatchRequestOptions) =>
  (response: HttpResponse<any>, meta: any, requestStartTime: number, requestEndTime: number): ApiSucceededAction => {
    return {
      type: AnalyticsAction.API_SUCCEEDED,
      payload: buildPayload(response, options.successId, options.successEventExtras, requestStartTime, requestEndTime),
      meta
    };
  };

/**
 * @deprecated Use AnalyticsInterceptor or EventDispatchService#trackApiFailure for Analytics 2.0
 */
export const onError = (options: HttpDispatchRequestOptions) =>
  (response: HttpErrorResponse, meta: any, requestStartTime: number, requestEndTime: number): ApiErrorAction => {
    const { isErrorCodeSuccess } = options;
    const eventType = isErrorHandled(isErrorCodeSuccess, response.status) ? AnalyticsAction.API_HANDLED_ERROR : AnalyticsAction.API_UNHANDLED_ERROR;
    return {
      type: eventType,
      payload: buildPayload(response, options.errorId, options.errorEventExtras, requestStartTime, requestEndTime),
      meta
    };
  };

/**
 * @deprecated Use AnalyticsInterceptor or EventDispatchService#trackApiComplete for Analytics 2.0
 */
export const onCompleted = (options: HttpDispatchRequestOptions) =>
  (response: HttpResponse<any>, meta: any, requestStartTime: number, requestEndTime: number): ApiCompletedAction => {
    return {
      type: AnalyticsAction.API_COMPLETED,
      payload: buildPayload(response, options.completedId, options.completedEventExtras, requestStartTime, requestEndTime),
      meta
    };
  };
