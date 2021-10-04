
import { HttpClient } from '@angular/common/http';
import { NgZone } from '@angular/core';

import { StringSelector } from '../../models/string-selector.interface';
import { Transform } from '../../models/transform.interface';
import { StateProvider } from '../../models/state-provider.type';

import { SplunkAnalyticsService } from './splunk-analytics.service';
import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { EventDispatchService } from '../../services/event-dispatch.service';

export function createSplunkAnalyticsService(
  http: HttpClient,
  zone: NgZone,
  eventBus: AnalyticsEventBusService,
  eventDispatchService: EventDispatchService,
  getEndpoint: StringSelector,
  getApiKey: StringSelector,
  transform: Transform,
  appStateFn$: StateProvider
) {
  return new SplunkAnalyticsService(
    http,
    zone,
    eventBus,
    eventDispatchService,
    getEndpoint,
    getApiKey,
    transform,
    appStateFn$
  );
}
