/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Injectable } from '@angular/core';
import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { AppErrorEvent } from '../models/app-error-event.interface';
import { AppEvent } from '../models/app-event.interface';
import { PageViewEvent } from '../models/page-view-event.interface';
import { AnalyticsEventBusService } from './analytics-event-bus.service';
import { LocationService } from './location.service';

@Injectable()
export class EventDispatchService {
  constructor(private locationService: LocationService, private eventBus: AnalyticsEventBusService) {}

  trackPageView(event?: PageViewEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.PAGE_VIEW_EVENT,
      location: this.locationService.getLocation(event?.activatedRoute),
    };
    eventDispatch.id ||= eventDispatch.location.path;

    this.dispatchEvent(eventDispatch);
  }

  trackAppEvent(event: AppEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.APP_EVENT,
      location: this.locationService.getLocation(),
    };
    this.dispatchEvent(eventDispatch);
  }

  trackAppError(event: AppErrorEvent): void {
    const eventDispatch = {
      ...event,
      eventType: AnalyticEventType.APP_ERROR_EVENT,
      location: this.locationService.getLocation(),
    };
    this.dispatchEvent(eventDispatch);
  }

  private dispatchEvent(event: AnalyticEvent): void {
    this.eventBus.dispatch(event);
  }
}
