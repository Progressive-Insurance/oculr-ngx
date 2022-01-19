/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { AnalyticEvent } from '../models/analytic-event.interface';
import { AnalyticsEventBusService } from './analytics-event-bus.service';

describe('AnalyticsEventBusService', () => {
  let service: AnalyticsEventBusService;

  beforeEach(() => (service = new AnalyticsEventBusService()));

  it('should allow dispatching analytic events to the standard event bus', () => {
    service.dispatch({ id: 'event' });
    service.events$.subscribe((event: AnalyticEvent) => {
      expect(event).toEqual({ id: 'event' });
    });
  });

  it('should allow dispatching custom events to the custom event bus', () => {
    service.dispatchCustomEvent({ id: 'customEvent' });
    service.customEvents$.subscribe((event: unknown) => {
      expect(event).toEqual({ id: 'customEvent' });
    });
  });
});
