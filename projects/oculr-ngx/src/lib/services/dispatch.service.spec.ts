/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { DispatchService } from './dispatch.service';

describe('DispatchService', () => {
  let mockLocationTrackingService: any;
  let dispatchService: DispatchService;
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
    dispatchService = new DispatchService(mockLocationTrackingService, mockEventBus);
  });

  describe('trackChange', () => {
    it('dispatches a CHANGE_EVENT event with model and location', () => {
      const mockEvent: any = { id: 'mock' };
      const mockEventDispatch: any = {
        id: 'mock',
        eventType: AnalyticEventType.CHANGE_EVENT,
        location: mockLocation,
      };
      dispatchService.trackChange(mockEvent);
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
      dispatchService.trackClick(mockEvent);
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
      dispatchService.trackDisplay(mockEvent);
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
      dispatchService.trackFocus(mockEvent);
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
      dispatchService.trackValidationError(mockEvent);
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
        dispatchService.trackApiStart(apiContext, httpRequest);
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
        dispatchService.trackApiStart(apiContext, httpRequest);
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
        dispatchService.trackApiComplete(apiContext, httpResponse, httpRequest, duration);
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
        dispatchService.trackApiComplete(apiContext, httpResponse, httpRequest, duration);
        expect(mockEventBus.dispatch).toHaveBeenCalledWith(expectedEvent);
      });
    });
  });
});
