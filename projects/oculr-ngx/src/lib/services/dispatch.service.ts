import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TimeoutError } from 'rxjs';
import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { ApiCompleteEvent } from '../models/api-complete-event.interface';
import { ApiContext } from '../models/api-context.interface';
import { ApiStartEvent } from '../models/api-start-event.interface';
import { ValidationErrorEvent } from '../models/validation-error-event.interface';
import { AnalyticsEventBusService } from './analytics-event-bus.service';
import { LocationService } from './location.service';

@Injectable()
export class DispatchService {
  constructor(private locationService: LocationService, private eventBus: AnalyticsEventBusService) {}

  trackChange(event: AnalyticEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.CHANGE_EVENT,
      location: this.locationService.getLocation(),
    };
    this.dispatchEvent(eventDispatch);
  }

  trackClick(event: AnalyticEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.CLICK_EVENT,
      location: this.locationService.getLocation(event.activatedRoute),
    };
    this.dispatchEvent(eventDispatch);
  }

  trackDisplay(event: AnalyticEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.DISPLAY_EVENT,
      location: this.locationService.getLocation(),
    };
    this.dispatchEvent(eventDispatch);
  }

  trackFocus(event: AnalyticEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.FOCUS_EVENT,
      location: this.locationService.getLocation(),
    };
    this.dispatchEvent(eventDispatch);
  }

  trackValidationError(event: ValidationErrorEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.VALIDATION_ERROR_EVENT,
      location: this.locationService.getLocation(),
    };
    this.dispatchEvent(eventDispatch);
  }

  trackApiStart(context: ApiContext, request: HttpRequest<unknown>): void {
    const eventDispatch: ApiStartEvent = {
      request,
      id: context.id || request.url, // TODO: request.url likely needs to be normalized
      scopes: context.scopes || [],
      eventType: AnalyticEventType.API_START_EVENT,
      location: this.locationService.getLocation(),
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
      location: this.locationService.getLocation(),
    };
    this.dispatchEvent(eventDispatch);
  }

  private dispatchEvent(event: AnalyticEvent): void {
    this.eventBus.dispatch(event);
  }
}
