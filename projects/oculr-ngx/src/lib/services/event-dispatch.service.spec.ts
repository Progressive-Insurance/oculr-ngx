/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { EventDispatchService } from './event-dispatch.service';

describe('EventDispatchService', () => {
  let mockLocationTrackingService: any;
  let eventDispatchService: EventDispatchService;
  let mockLocation: any;
  let mockEventBus: any;

  beforeEach(() => {
    mockLocation = { angularRoute: '/here', path: '/there' };
    mockEventBus = {
      dispatch: jasmine.createSpy('dispatch'),
    };
    mockLocationTrackingService = {
      getLocation: () => mockLocation,
    };
    eventDispatchService = new EventDispatchService(mockLocationTrackingService, mockEventBus);
  });

  describe('trackPageView', () => {
    it('sets a default event id when one is not supplied', () => {
      const expectedDispatch = {
        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
        location: mockLocation,
        id: mockLocation.path,
      };

      eventDispatchService.trackPageView();

      expect(mockEventBus.dispatch).toHaveBeenCalledWith(expectedDispatch);
    });

    it('does not set a default event id when one is supplied', () => {
      const mockEvent = { id: 'id' };
      const expectedDispatch = {
        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
        location: mockLocation,
        id: 'id',
      };

      eventDispatchService.trackPageView(mockEvent);

      expect(mockEventBus.dispatch).toHaveBeenCalledWith(expectedDispatch);
    });
  });

  describe('trackAppEvent', () => {
    it('dispatches a APP_EVENT event with model and location', () => {
      const mockEvent: any = { id: 'app-init' };
      const mockEventDispatch: any = {
        id: 'app-init',
        eventType: AnalyticEventType.APP_EVENT,
        location: mockLocation,
      };
      eventDispatchService.trackAppEvent(mockEvent);
      expect(mockEventBus.dispatch).toHaveBeenCalledWith(mockEventDispatch);
    });
  });

  describe('trackAppError', () => {
    it('dispatches a APP_ERROR event with model and location', () => {
      const mockEvent: any = { id: 'error' };
      const mockEventDispatch: any = {
        id: 'error',
        eventType: AnalyticEventType.APP_ERROR_EVENT,
        location: mockLocation,
      };
      eventDispatchService.trackAppError(mockEvent);
      expect(mockEventBus.dispatch).toHaveBeenCalledWith(mockEventDispatch);
    });
  });
});
