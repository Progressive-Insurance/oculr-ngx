/* 
Copyright (c) 2021 Progressive Casualty Insurance Company. All rights reserved.

Progressive-owned, no external contributions.
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
