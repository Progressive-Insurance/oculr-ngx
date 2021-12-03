/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
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

  describe('trackChange', () => {
    it('dispatches a CHANGE_EVENT event with model and location', () => {
      const mockEvent: any = { id: 'mock' };
      const mockEventDispatch: any = {
        id: 'mock',
        eventType: AnalyticEventType.CHANGE_EVENT,
        location: mockLocation,
      };
      eventDispatchService.trackChange(mockEvent);
      expect(mockEventBus.dispatch).toHaveBeenCalledWith(mockEventDispatch);
    });
  });

  describe('trackClick', () => {
    it('dispatches a CLICK_EVENT event with model and location', () => {
      const mockEvent: any = { id: 'mock' };
      const mockEventDispatch: any = {
        id: 'mock',
        eventType: AnalyticEventType.CLICK_EVENT,
        location: mockLocation,
      };
      eventDispatchService.trackClick(mockEvent);
      expect(mockEventBus.dispatch).toHaveBeenCalledWith(mockEventDispatch);
    });
  });

  describe('trackDisplay', () => {
    it('dispatches a DISPLAY_EVENT event with model and location', () => {
      const mockEvent: any = { id: 'mock' };
      const mockEventDispatch: any = {
        id: 'mock',
        eventType: AnalyticEventType.DISPLAY_EVENT,
        location: mockLocation,
      };
      eventDispatchService.trackDisplay(mockEvent);
      expect(mockEventBus.dispatch).toHaveBeenCalledWith(mockEventDispatch);
    });
  });

  describe('trackFocus', () => {
    it('dispatches a FOCUS_EVENT event with model and location', () => {
      const mockEvent: any = { id: 'mock' };
      const mockEventDispatch: any = {
        id: 'mock',
        eventType: AnalyticEventType.FOCUS_EVENT,
        location: mockLocation,
      };
      eventDispatchService.trackFocus(mockEvent);
      expect(mockEventBus.dispatch).toHaveBeenCalledWith(mockEventDispatch);
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

  describe('trackValidationError', () => {
    it('dispatches a VALIDATION_ERROR_EVENT event with model and location', () => {
      const mockEvent: any = { id: 'error' };
      const mockEventDispatch: any = {
        id: 'error',
        eventType: AnalyticEventType.VALIDATION_ERROR_EVENT,
        location: mockLocation,
      };
      eventDispatchService.trackValidationError(mockEvent);
      expect(mockEventBus.dispatch).toHaveBeenCalledWith(mockEventDispatch);
    });
  });

  describe('API Event Actions', () => {
    const httpRequest: any = { url: 'http://localhost:3000/breed/getAll', method: 'GET' };
    const httpResponse: any = { url: 'http://localhost:3000/breed/getAll', status: 200 };

    describe('trackApiStart', () => {
      it('dispatches an API_START_EVENT with the supplied id and scopes', () => {
        const apiContext: any = { id: 'api start', scopes: [{ data: 'starting' }] };
        const expectedEvent: any = {
          request: httpRequest,
          id: apiContext.id,
          scopes: apiContext.scopes,
          eventType: AnalyticEventType.API_START_EVENT,
          location: mockLocation,
        };
        eventDispatchService.trackApiStart(apiContext, httpRequest);
        expect(mockEventBus.dispatch).toHaveBeenCalledWith(expectedEvent);
      });

      it('dispatches an API_START_EVENT with the api url as an id', () => {
        const apiContext: any = {};
        const expectedEvent: any = {
          request: httpRequest,
          id: httpRequest.url,
          scopes: [],
          eventType: AnalyticEventType.API_START_EVENT,
          location: mockLocation,
        };
        eventDispatchService.trackApiStart(apiContext, httpRequest);
        expect(mockEventBus.dispatch).toHaveBeenCalledWith(expectedEvent);
      });
    });

    describe('trackApiComplete', () => {
      it('dispatches an API_COMPLETE_EVENT with the supplied id and scopes', () => {
        const apiContext: any = { id: 'api complete', scopes: [{ data: 'starting' }] };
        const duration = 312;
        const expectedEvent: any = {
          response: httpResponse,
          request: httpRequest,
          duration,
          id: apiContext.id,
          scopes: apiContext.scopes,
          eventType: AnalyticEventType.API_COMPLETE_EVENT,
          location: mockLocation,
        };
        eventDispatchService.trackApiComplete(apiContext, httpResponse, httpRequest, duration);
        expect(mockEventBus.dispatch).toHaveBeenCalledWith(expectedEvent);
      });

      it('dispatches an API_COMPLETE_EVENT with the api url as an id', () => {
        const apiContext: any = {};
        const duration = 312;
        const expectedEvent: any = {
          response: httpResponse,
          request: httpRequest,
          duration,
          id: httpRequest.url,
          scopes: [],
          eventType: AnalyticEventType.API_COMPLETE_EVENT,
          location: mockLocation,
        };
        eventDispatchService.trackApiComplete(apiContext, httpResponse, httpRequest, duration);
        expect(mockEventBus.dispatch).toHaveBeenCalledWith(expectedEvent);
      });
    });
  });
});
