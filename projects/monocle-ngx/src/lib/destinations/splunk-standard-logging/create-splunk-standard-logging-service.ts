import { HttpClient } from '@angular/common/http';
import { NgZone } from '@angular/core';
import { Scheduler } from 'rxjs';

import { SplunkStandardLoggingService } from './splunk-standard-logging.service';
import { StringSelector } from '../../models/string-selector.interface';
import { Transform } from '../../models/transform.interface';
import { StateProvider } from '../../models/state-provider.type';
import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { EventDispatchService } from '../../services/event-dispatch.service';

export function createSplunkStandardLoggingService(
  http: HttpClient,
  zone: NgZone,
  eventBus: AnalyticsEventBusService,
  eventDispatchService: EventDispatchService,
  getEndpoint: StringSelector,
  getApiKey: StringSelector,
  transform: Transform,
  appStateFn$: StateProvider,
  scheduler: Scheduler
) {
  return new SplunkStandardLoggingService(
    http,
    zone,
    eventBus,
    eventDispatchService,
    getEndpoint,
    getApiKey,
    transform,
    appStateFn$,
    scheduler
  );
}
