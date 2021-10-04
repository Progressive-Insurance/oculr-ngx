import { HttpResponse, HttpErrorResponse, HttpResponseBase, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TimeoutError } from 'rxjs';

import { EventModel } from '../models/event-model.class';
import { EventPayload } from '../models/event-payload.interface';
import {
  analyticsError,
  apiCompleteEvent,
  apiStartEvent,
  apiSuccessEvent,
  apiFailureEvent,
  displayEvent,
  interactionEvent,
  pageViewEvent,
  validationErrorEvent,
  systemEvent,
  appInit,
  appError
} from '../actions/analytics.actions';
import { timeoutErrorStatusCode, unknownErrorStatusCode } from '../interceptors/constants';
import { LocationTrackingService } from './location-tracking.service';
import { AnalyticsEventBusService } from './analytics-event-bus.service';
import { EventCacheService } from './event-cache.service';
import { AnalyticsGenericAction } from '../models/actions/analytics-generic-action.interface';

@Injectable()
export class EventDispatchService {

  constructor(
    private locationTrackingService: LocationTrackingService,
    private eventBus: AnalyticsEventBusService,
    private eventCache: EventCacheService
  ) { }

  trackAnalyticsError = (error: any) => {
    this.dispatch(analyticsError(error));
  }

  trackPageView = (eventModel: EventModel, config?: { replaceParamTokens: string[] }) => {
    this.locationTrackingService.updateRouteConfig(config);
    const payload: EventPayload = {
      eventModel,
      eventLocation: this.locationTrackingService.location
    };
    this.dispatch(pageViewEvent(payload));
  }

  trackInteraction = (eventModel: EventModel, event?: any) => {
    const payload: EventPayload = {
      eventModel: this.updateModelWithEventDetails(eventModel, event),
      eventLocation: this.locationTrackingService.location
    };
    this.dispatch(interactionEvent(payload));
  }

  trackDisplay = (eventModel: EventModel) => {
    const payload: EventPayload = {
      eventModel,
      eventLocation: this.locationTrackingService.location
    };
    this.dispatch(displayEvent(payload));
  }

  trackAppInit = (scopes: string[]): void => {
    const payload: EventPayload = {
      eventLocation: this.locationTrackingService.location,
      eventModel: new EventModel('', '', '', '', '', '', '', '', {}, scopes, '', '', {})
    };
    this.dispatch(appInit(payload));
  }

  trackAppError = (error: Error | string) => {
    const payload: EventPayload = {
      eventLocation: this.locationTrackingService.location,
      eventModel: new EventModel('', '', '', '', '', '', '', '', {}, [], '', '', {})
    };
    this.dispatch(appError(payload, {error}));
  }

  trackSystemEvent = (eventModel: EventModel) => {
    const payload: EventPayload = {
      eventModel,
      eventLocation: this.locationTrackingService.location
    };
    this.dispatch(systemEvent(payload));
  }

  trackValidationError = (eventModel: EventModel) => {
    const payload: EventPayload = {
      eventModel,
      eventLocation: this.locationTrackingService.location
    };
    this.dispatch(validationErrorEvent(payload));
  }

  trackApiStart = (eventModel: EventModel, request: HttpRequest<any>) => {
    const payload: EventPayload = {
      eventModel,
      eventLocation: this.locationTrackingService.location
    };
    this.dispatch(apiStartEvent(payload, { request }));
  }

  trackApiSuccess = (
    eventModel: EventModel,
    response: HttpResponse<any>,
    requestStartTime: number,
    requestEndTime: number,
    apiEndpoint: string,
    httpMethod: string
  ) => {
    const duration = Math.round(requestEndTime - requestStartTime);
    const httpStatus = response.status.toString();
    const payload: EventPayload = {
      eventModel: this.updateModelWithApiResults(eventModel, response, duration),
      eventLocation: this.locationTrackingService.location
    };
    this.dispatch(apiSuccessEvent(payload, { response, duration, apiEndpoint, httpStatus, httpMethod, hasEventModelTag: true }));
  }

  trackApiFailure = (
    eventModel: EventModel,
    error: HttpErrorResponse | TimeoutError,
    requestStartTime: number,
    requestEndTime: number,
    apiEndpoint: string,
    httpMethod: string
  ) => {
    const duration = Math.round(requestEndTime - requestStartTime);
    const httpStatus = error instanceof HttpErrorResponse
      ? error.status.toString()
      : error['name'] === 'TimeoutError' ? timeoutErrorStatusCode : unknownErrorStatusCode;
    const payload: EventPayload = {
      eventModel: this.updateModelWithApiResults(eventModel, error, duration),
      eventLocation: this.locationTrackingService.location
    };
    this.dispatch(apiFailureEvent(payload, { response: error, duration, apiEndpoint, httpStatus, httpMethod, hasEventModelTag: true }));
  }

  trackApiComplete = (
    eventModel: EventModel,
    response: HttpResponse<any> | HttpErrorResponse | TimeoutError,
    requestStartTime: number,
    requestEndTime: number,
    apiEndpoint: string,
    httpMethod: string,
    hasEventModelTag: boolean = true
  ) => {
    const duration = Math.round(requestEndTime - requestStartTime);
    const httpStatus = response instanceof HttpResponseBase
      ? response.status.toString()
      : response['name'] === 'TimeoutError' ? timeoutErrorStatusCode : unknownErrorStatusCode;
    const payload: EventPayload = {
      eventModel: this.updateModelWithApiResults(eventModel, response, duration),
      eventLocation: this.locationTrackingService.location
    };
    this.dispatch(apiCompleteEvent(payload, { response, duration, apiEndpoint, httpStatus, httpMethod, hasEventModelTag }));
  }

  trackCachedPageView = () => {
    const cachedPageView = this.eventCache.getLastRouterPageViewEvent();
    if (cachedPageView) {
      this.trackPageView(cachedPageView);
    }
  }

  private updateModelWithApiResults = (model: EventModel, response: HttpResponse<any> | HttpErrorResponse | TimeoutError, duration: number) => {
    return {
      ...model,
      eventValue: (typeof model.eventValue === 'function') ? model.eventValue(duration) : model.eventValue,
      customDimensions: this.evaluateCustomDimensions(model.customDimensions, response)
    };
  }

  private updateModelWithEventDetails = (model: EventModel, event: any) => {
    return {
      ...model,
      customDimensions: this.evaluateCustomDimensions(model.customDimensions, event)
    };
  }

  private evaluateCustomDimensions = (customDimensions: { [dimension: string]: any }, data: any) => {
    return Object.keys(customDimensions)
      .reduce((dimensionsObj: any, currentField: string) => {
        const field = customDimensions[currentField];
        dimensionsObj[currentField] = (typeof field === 'function') ? field(data) : field;
        return dimensionsObj;
      }, {});
  }

  private dispatch(action: AnalyticsGenericAction) {
    this.eventBus.dispatch(action);
    this.eventCache.cacheEvent(action);
  }

}
