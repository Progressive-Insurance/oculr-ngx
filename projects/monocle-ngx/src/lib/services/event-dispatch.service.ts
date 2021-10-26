import { HttpErrorResponse, HttpRequest, HttpResponse, HttpResponseBase } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TimeoutError } from 'rxjs';
import {
  analyticsError,
  apiCompleteEvent,
  apiFailureEvent,
  apiStartEvent,
  apiSuccessEvent,
  appError,
  appInit,
  systemEvent,
  validationErrorEvent,
} from '../actions/analytics.actions';
import { timeoutErrorStatusCode, unknownErrorStatusCode } from '../interceptors/constants';
import { AnalyticsGenericAction } from '../models/actions/analytics-generic-action.interface';
import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { DisplayEvent } from '../models/display-event.interface';
import { EventModel } from '../models/event-model.class';
import { EventPayload } from '../models/event-payload.interface';
import { AnalyticsEventBusService } from './analytics-event-bus.service';
import { EventCacheService } from './event-cache.service';
import { LocationTrackingService } from './location-tracking.service';

@Injectable()
export class EventDispatchService {
  constructor(
    private locationTrackingService: LocationTrackingService,
    private eventBus: AnalyticsEventBusService,
    private eventCache: EventCacheService
  ) {}

  trackAnalyticsError(error: unknown): void {
    this.dispatch(analyticsError(error));
  }

  trackPageView(event: AnalyticEvent, config?: { replaceParamTokens: string[] }): void {
    this.locationTrackingService.updateRouteConfig(config);
    const eventDispatch = {
      ...event,
      location: this.locationTrackingService.location,
    };
    this.dispatchEvent(eventDispatch);
  }

  trackButtonInteraction(event: AnalyticEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.BUTTON_INTERACTION_EVENT,
      location: this.locationTrackingService.location,
    };
    this.dispatchEvent(eventDispatch);
  }

  trackDisplay(event: DisplayEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.DISPLAY_EVENT,
      location: this.locationTrackingService.location,
    };
    this.dispatchEvent(eventDispatch);
  }

  trackAppInit(scopes: string[]): void {
    const payload: EventPayload = {
      eventLocation: this.locationTrackingService.location,
      eventModel: new EventModel('', '', '', '', '', '', '', '', {}, scopes, '', '', {}),
    };
    this.dispatch(appInit(payload));
  }

  trackAppError(error: Error | string): void {
    const payload: EventPayload = {
      eventLocation: this.locationTrackingService.location,
      eventModel: new EventModel('', '', '', '', '', '', '', '', {}, [], '', '', {}),
    };
    this.dispatch(appError(payload, { error }));
  }

  trackSystemEvent(eventModel: EventModel): void {
    const payload: EventPayload = {
      eventModel,
      eventLocation: this.locationTrackingService.location,
    };
    this.dispatch(systemEvent(payload));
  }

  trackValidationError(eventModel: EventModel): void {
    const payload: EventPayload = {
      eventModel,
      eventLocation: this.locationTrackingService.location,
    };
    this.dispatch(validationErrorEvent(payload));
  }

  trackApiStart(eventModel: EventModel, request: HttpRequest<unknown>): void {
    const payload: EventPayload = {
      eventModel,
      eventLocation: this.locationTrackingService.location,
    };
    this.dispatch(apiStartEvent(payload, { request }));
  }

  trackApiSuccess(
    eventModel: EventModel,
    response: HttpResponse<unknown>,
    requestStartTime: number,
    requestEndTime: number,
    apiEndpoint: string,
    httpMethod: string
  ): void {
    const duration = Math.round(requestEndTime - requestStartTime);
    const httpStatus = response.status.toString();
    const payload: EventPayload = {
      eventModel: this.updateModelWithApiResults(eventModel, response, duration),
      eventLocation: this.locationTrackingService.location,
    };
    this.dispatch(
      apiSuccessEvent(payload, { response, duration, apiEndpoint, httpStatus, httpMethod, hasEventModelTag: true })
    );
  }

  trackApiFailure(
    eventModel: EventModel,
    error: HttpErrorResponse | TimeoutError,
    requestStartTime: number,
    requestEndTime: number,
    apiEndpoint: string,
    httpMethod: string
  ): void {
    const duration = Math.round(requestEndTime - requestStartTime);
    const httpStatus =
      error instanceof HttpErrorResponse
        ? error.status.toString()
        : error['name'] === 'TimeoutError'
        ? timeoutErrorStatusCode
        : unknownErrorStatusCode;
    const payload: EventPayload = {
      eventModel: this.updateModelWithApiResults(eventModel, error, duration),
      eventLocation: this.locationTrackingService.location,
    };
    this.dispatch(
      apiFailureEvent(payload, {
        response: error,
        duration,
        apiEndpoint,
        httpStatus,
        httpMethod,
        hasEventModelTag: true,
      })
    );
  }

  trackApiComplete(
    eventModel: EventModel,
    response: HttpResponse<unknown> | HttpErrorResponse | TimeoutError,
    requestStartTime: number,
    requestEndTime: number,
    apiEndpoint: string,
    httpMethod: string,
    hasEventModelTag = true
  ): void {
    const duration = Math.round(requestEndTime - requestStartTime);
    const httpStatus =
      response instanceof HttpResponseBase
        ? response.status.toString()
        : response['name'] === 'TimeoutError'
        ? timeoutErrorStatusCode
        : unknownErrorStatusCode;
    const payload: EventPayload = {
      eventModel: this.updateModelWithApiResults(eventModel, response, duration),
      eventLocation: this.locationTrackingService.location,
    };
    this.dispatch(
      apiCompleteEvent(payload, { response, duration, apiEndpoint, httpStatus, httpMethod, hasEventModelTag })
    );
  }

  trackCachedPageView(): void {
    const cachedPageView = this.eventCache.getLastRouterPageViewEvent();
    if (cachedPageView) {
      this.trackPageView(cachedPageView);
    }
  }

  private updateModelWithApiResults(
    model: EventModel,
    response: HttpResponse<unknown> | HttpErrorResponse | TimeoutError,
    duration: number
  ): EventModel {
    return {
      ...model,
      eventValue: (typeof model.eventValue === 'function' ? model.eventValue(duration) : model.eventValue) as
        | number
        | string
        | ((val: number) => number | string),
      customDimensions: this.evaluateCustomDimensions(model.customDimensions, response),
    };
  }

  private evaluateCustomDimensions(
    customDimensions: { [dimension: string]: unknown },
    data?: EventDetails
  ): { [dimension: string]: unknown } {
    return Object.keys(customDimensions).reduce(
      (dimensionsObj: { [dimension: string]: unknown }, currentField: string) => {
        const field = customDimensions[currentField];
        dimensionsObj[currentField] = (typeof field === 'function' ? field(data) : field) as unknown;
        return dimensionsObj;
      },
      {}
    );
  }

  // TODO: Remove once all tracked events are refactored
  private dispatch(action: AnalyticsGenericAction): void {
    console.log(action);
  }

  private dispatchEvent(event: AnalyticEvent): void {
    console.log(event);
    this.eventBus.dispatch(event);
    this.eventCache.cacheEvent(event);
  }
}

type EventDetails = Event | HttpResponse<unknown> | HttpErrorResponse | TimeoutError;
