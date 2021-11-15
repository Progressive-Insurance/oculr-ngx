/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TimeoutError } from 'rxjs';
import { analyticsError, appError, appInit, systemEvent, validationErrorEvent } from '../actions/analytics.actions';
import { AnalyticsGenericAction } from '../models/actions/analytics-generic-action.interface';
import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { ApiCompleteEvent } from '../models/api-complete-event.interface';
import { ApiContext } from '../models/api-context.interface';
import { ApiStartEvent } from '../models/api-start-event.interface';
import { DisplayEvent } from '../models/display-event.interface';
import { EventModel } from '../models/event-model.class';
import { EventPayload } from '../models/event-payload.interface';
import { PageViewEvent } from '../models/page-view-event.interface';
import { AnalyticsEventBusService } from './analytics-event-bus.service';
import { LocationTrackingService } from './location-tracking.service';

@Injectable()
export class EventDispatchService {
  constructor(private locationTrackingService: LocationTrackingService, private eventBus: AnalyticsEventBusService) {}

  trackAnalyticsError(error: unknown): void {
    this.dispatch(analyticsError(error));
  }

  trackPageView(event?: PageViewEvent, config?: { replaceParamTokens: string[] }): void {
    this.locationTrackingService.updateRouteConfig(config);

    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.PAGE_VIEW_EVENT,
      location: this.locationTrackingService.location,
    };
    eventDispatch.id ||= eventDispatch.location.path;

    this.dispatchEvent(eventDispatch);
    if (!eventDispatch.isModal) {
      this.locationTrackingService.cachePageView(eventDispatch);
    }
  }

  trackCachedPageView(): void {
    const cachedPageView = this.locationTrackingService.lastPageViewEvent;
    if (cachedPageView) {
      this.trackPageView(cachedPageView);
    }
  }

  trackChange(event: AnalyticEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.CHANGE_EVENT,
      location: this.locationTrackingService.location,
    };
    this.dispatchEvent(eventDispatch);
  }

  trackClick(event: AnalyticEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.CLICK_EVENT,
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

  trackApiStart(context: ApiContext, request: HttpRequest<unknown>): void {
    const eventDispatch: ApiStartEvent = {
      request,
      id: context.id || request.url, // TODO: request.url likely needs to be normalized
      scopes: context.scopes || [],
      eventType: AnalyticEventType.API_START_EVENT,
      location: this.locationTrackingService.location,
    };
    this.dispatchEvent(eventDispatch);
  }

  trackApiComplete(
    context: ApiContext,
    response: HttpResponse<unknown> | HttpErrorResponse | TimeoutError,
    request: HttpRequest<unknown>,
    duration: number
  ): void {
    const eventDispatch: ApiCompleteEvent = {
      response,
      request,
      duration,
      id: context.id || request.url, // TODO: request.url likely needs to be normalized
      scopes: context.scopes || [],
      eventType: AnalyticEventType.API_COMPLETE_EVENT,
      location: this.locationTrackingService.location,
    };
    this.dispatchEvent(eventDispatch);
  }

  // TODO: Remove once all tracked events are refactored
  private dispatch(action: AnalyticsGenericAction): void {
    console.log(action);
  }

  // TODO: Can probably remove and replace with single call to eventBus.dispatch
  private dispatchEvent(event: AnalyticEvent): void {
    this.eventBus.dispatch(event);
  }
}
