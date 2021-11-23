/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { AnalyticsAction } from '../models/actions/analytics-action.enum';
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

  xdescribe('trackError', () => {
    it('dispatches an ANALYTICS_ERROR action with attached error', () => {
      const mockError = new Error('You done messed up big');
      const mockEvent: any = {
        type: AnalyticsAction.ANALYTICS_ERROR,
        payload: {
          error: mockError,
        },
      };
      eventDispatchService.trackAnalyticsError(mockError);
      expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(mockEvent);
    });
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

  describe('trackDisplay', () => {
    it('dispatches an DISPLAY_EVENT action with model and location', () => {
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

  xdescribe('trackSystemEvent', () => {
    it('dispatches an SYSTEM_EVENT action with model and location', () => {
      const mockModel: any = { event: 'mock', customDimensions: { pagePosition: 'Header' } };
      const expectedAction: any = {
        type: AnalyticsAction.SYSTEM_EVENT,
        payload: {
          eventModel: mockModel,
          eventLocation: mockLocation,
        },
      };
      eventDispatchService.trackSystemEvent(mockModel);
      expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
    });
  });

  xdescribe('trackValidationError', () => {
    it('dispatches an VALIDATION_ERROR_EVENT action with model and location', () => {
      const mockModel: any = { event: 'mock' };
      const mockEvent: any = {
        type: AnalyticsAction.VALIDATION_ERROR_EVENT,
        payload: {
          eventModel: mockModel,
          eventLocation: mockLocation,
        },
      };
      eventDispatchService.trackValidationError(mockModel);
      expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(mockEvent);
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
