import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

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
      location: mockLocation,
      updateRouteConfig: () => undefined,
      cachePageView: jasmine.createSpy('cachePageView'),
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
      const mockEvent = { isModal: true };
      const expectedDispatch = {
        isModal: true,
        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
        location: mockLocation,
        id: mockLocation.path,
      };

      eventDispatchService.trackPageView(mockEvent);

      expect(mockEventBus.dispatch).toHaveBeenCalledWith(expectedDispatch);
    });

    it('does not set a default event id when one is supplied', () => {
      const mockEvent = { isModal: true, id: 'id' };
      const expectedDispatch = {
        isModal: true,
        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
        location: mockLocation,
        id: 'id',
      };

      eventDispatchService.trackPageView(mockEvent);

      expect(mockEventBus.dispatch).toHaveBeenCalledWith(expectedDispatch);
    });

    it('does not cache the event when isModal is true', () => {
      const mockEvent = { isModal: true };
      eventDispatchService.trackPageView(mockEvent);
      expect(mockLocationTrackingService.cachePageView).not.toHaveBeenCalled();
    });

    it('does cache the event when isModal is false', () => {
      const mockEvent = { isModal: false };
      const expectedDispatch = {
        isModal: false,
        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
        location: mockLocation,
        id: mockLocation.path,
      };

      eventDispatchService.trackPageView(mockEvent);

      expect(mockLocationTrackingService.cachePageView).toHaveBeenCalledWith(expectedDispatch);
    });
  });

  describe('trackCachedPageView', () => {
    it('tracks the cached page view event when it exists', () => {
      const cachedEvent = {
        id: 'cached',
        eventType: AnalyticEventType.PAGE_VIEW_EVENT,
        location: mockLocation,
      };
      mockLocationTrackingService.lastPageViewEvent = cachedEvent;
      eventDispatchService.trackCachedPageView();
      expect(mockEventBus.dispatch).toHaveBeenCalledWith(cachedEvent);
    });

    it('does nothing if there is no cached page view event', () => {
      eventDispatchService.trackCachedPageView();
      expect(mockEventBus.dispatch).not.toHaveBeenCalled();
    });
  });

  describe('trackDisplay', () => {
    it('dispatches an DISPLAY_EVENT action with model and location', () => {
      console.log = jasmine.createSpy('log');
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

  xdescribe('API Event Actions', () => {
    const httpRequest: any = { url: 'http://localhost:3000/breed/getAll', method: 'GET' };

    describe('trackApiStart', () => {
      it('dispatches an API_START_EVENT action', () => {
        const eventModel: any = { eventId: 'EVENT_HASH' };
        const expectedAction: any = {
          type: AnalyticsAction.API_START_EVENT,
          payload: {
            eventModel,
            eventLocation: mockLocation,
          },
          meta: {
            request: httpRequest,
          },
        };
        eventDispatchService.trackApiStart(eventModel, httpRequest);
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });
    });

    describe('trackApiSuccess', () => {
      it('dispatches an API_SUCCESS_EVENT action', () => {
        const httpResponse: any = { status: 200 };
        const eventModel: any = { eventId: 'EVENT_HASH', eventValue: 0, customDimensions: {} };
        const expectedAction: any = {
          type: AnalyticsAction.API_SUCCESS_EVENT,
          payload: {
            eventModel,
            eventLocation: mockLocation,
          },
          meta: {
            response: httpResponse,
            duration: 5000,
            apiEndpoint: httpRequest.url,
            httpStatus: '200',
            httpMethod: httpRequest.method,
            hasEventModelTag: true,
          },
        };
        eventDispatchService.trackApiSuccess(
          eventModel,
          httpResponse,
          315550800000,
          315550805000,
          httpRequest.url,
          httpRequest.method
        );
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });

      it('runs eventValue function if present', () => {
        const httpResponse: any = { status: 200 };
        const eventModel: any = {
          eventId: 'EVENT_HASH',
          eventValue: (duration: any) => duration,
          customDimensions: {},
        };
        const expectedAction: any = {
          type: AnalyticsAction.API_SUCCESS_EVENT,
          payload: {
            eventModel: {
              eventId: 'EVENT_HASH',
              eventValue: 5000,
              customDimensions: {},
            },
            eventLocation: mockLocation,
          },
          meta: {
            response: httpResponse,
            duration: 5000,
            apiEndpoint: httpRequest.url,
            httpStatus: '200',
            httpMethod: httpRequest.method,
            hasEventModelTag: true,
          },
        };
        eventDispatchService.trackApiSuccess(
          eventModel,
          httpResponse,
          315550800000,
          315550805000,
          httpRequest.url,
          httpRequest.method
        );
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });
      it('runs customDimensions functions if present', () => {
        const httpResponse: any = { status: 200, body: { policies: ['10000000', '20000000'] } };
        const eventModel: any = {
          eventId: 'EVENT_HASH',
          eventValue: 0,
          customDimensions: {
            isAwesome: true,
            policyCount: (response: any) => response.body.policies.length,
          },
        };
        const expectedAction: any = {
          type: AnalyticsAction.API_SUCCESS_EVENT,
          payload: {
            eventModel: {
              eventId: 'EVENT_HASH',
              eventValue: 0,
              customDimensions: {
                isAwesome: true,
                policyCount: 2,
              },
            },
            eventLocation: mockLocation,
          },
          meta: {
            response: httpResponse,
            duration: 5000,
            apiEndpoint: httpRequest.url,
            httpStatus: '200',
            httpMethod: httpRequest.method,
            hasEventModelTag: true,
          },
        };
        eventDispatchService.trackApiSuccess(
          eventModel,
          httpResponse,
          315550800000,
          315550805000,
          httpRequest.url,
          httpRequest.method
        );
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });
    });
    describe('trackApiFailure', () => {
      it('dispatches an API_FAILURE_EVENT action', () => {
        const httpResponse = new HttpErrorResponse({ status: 500 });
        const eventModel: any = { eventId: 'EVENT_HASH', eventValue: 0, customDimensions: {} };
        const expectedAction: any = {
          type: AnalyticsAction.API_FAILURE_EVENT,
          payload: {
            eventModel,
            eventLocation: mockLocation,
          },
          meta: {
            response: httpResponse,
            duration: 5000,
            apiEndpoint: httpRequest.url,
            httpStatus: '500',
            httpMethod: httpRequest.method,
            hasEventModelTag: true,
          },
        };
        eventDispatchService.trackApiFailure(
          eventModel,
          httpResponse,
          315550800000,
          315550805000,
          httpRequest.url,
          httpRequest.method
        );
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });

      it('runs eventValue function if present', () => {
        const httpResponse = new HttpErrorResponse({ status: 500 });
        const eventModel: any = {
          eventId: 'EVENT_HASH',
          eventValue: (duration: any) => duration,
          customDimensions: {},
        };
        const expectedAction: any = {
          type: AnalyticsAction.API_FAILURE_EVENT,
          payload: {
            eventModel: {
              eventId: 'EVENT_HASH',
              eventValue: 5000,
              customDimensions: {},
            },
            eventLocation: mockLocation,
          },
          meta: {
            response: httpResponse,
            duration: 5000,
            apiEndpoint: httpRequest.url,
            httpStatus: '500',
            httpMethod: httpRequest.method,
            hasEventModelTag: true,
          },
        };
        eventDispatchService.trackApiFailure(
          eventModel,
          httpResponse,
          315550800000,
          315550805000,
          httpRequest.url,
          httpRequest.method
        );
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });

      it('runs customDimensions functions if present', () => {
        const httpResponse = new HttpErrorResponse({ status: 500, error: { message: 'Server fell over dead.' } });
        const eventModel: any = {
          eventId: 'EVENT_HASH',
          eventValue: 0,
          customDimensions: {
            isAwesome: false,
            errorMessage: (response: any) => response.error.message,
          },
        };
        const expectedAction: any = {
          type: AnalyticsAction.API_FAILURE_EVENT,
          payload: {
            eventModel: {
              eventId: 'EVENT_HASH',
              eventValue: 0,
              customDimensions: {
                isAwesome: false,
                errorMessage: 'Server fell over dead.',
              },
            },
            eventLocation: mockLocation,
          },
          meta: {
            response: httpResponse,
            duration: 5000,
            apiEndpoint: httpRequest.url,
            httpStatus: '500',
            httpMethod: httpRequest.method,
            hasEventModelTag: true,
          },
        };
        eventDispatchService.trackApiFailure(
          eventModel,
          httpResponse,
          315550800000,
          315550805000,
          httpRequest.url,
          httpRequest.method
        );
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });

      it(`uses '-1001' for meta's httpStatus code when response is a TimeoutError`, () => {
        const error = {
          message: 'Timeout has occurred',
          name: 'TimeoutError',
          info: { meta: {}, seen: 0, lastValue: {} },
        };
        const eventModel: any = { eventId: 'EVENT_HASH', eventValue: 0, customDimensions: {} };
        const expectedAction: any = {
          type: AnalyticsAction.API_FAILURE_EVENT,
          payload: {
            eventModel,
            eventLocation: mockLocation,
          },
          meta: {
            response: error,
            duration: 5000,
            apiEndpoint: httpRequest.url,
            httpStatus: '-1001',
            httpMethod: httpRequest.method,
            hasEventModelTag: true,
          },
        };
        eventDispatchService.trackApiFailure(
          eventModel,
          error,
          315550800000,
          315550805000,
          httpRequest.url,
          httpRequest.method
        );
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });
    });

    describe('trackApiComplete', () => {
      it('dispatches an API_COMPLETE_EVENT action', () => {
        const httpResponse = new HttpResponse<any>({ status: 200 });
        const eventModel: any = { eventId: 'EVENT_HASH', eventValue: 0, customDimensions: {} };
        const expectedAction: any = {
          type: AnalyticsAction.API_COMPLETE_EVENT,
          payload: {
            eventModel,
            eventLocation: mockLocation,
          },
          meta: {
            response: httpResponse,
            duration: 5000,
            apiEndpoint: httpRequest.url,
            httpStatus: '200',
            httpMethod: httpRequest.method,
            hasEventModelTag: true,
          },
        };
        eventDispatchService.trackApiComplete(
          eventModel,
          httpResponse,
          315550800000,
          315550805000,
          httpRequest.url,
          httpRequest.method
        );
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });

      it('runs eventValue function if present', () => {
        const httpResponse = new HttpErrorResponse({ status: 500 });
        const eventModel: any = {
          eventId: 'EVENT_HASH',
          eventValue: (duration: any) => duration,
          customDimensions: {},
        };
        const expectedAction: any = {
          type: AnalyticsAction.API_COMPLETE_EVENT,
          payload: {
            eventModel: {
              eventId: 'EVENT_HASH',
              eventValue: 5000,
              customDimensions: {},
            },
            eventLocation: mockLocation,
          },
          meta: {
            response: httpResponse,
            duration: 5000,
            apiEndpoint: httpRequest.url,
            httpStatus: '500',
            httpMethod: httpRequest.method,
            hasEventModelTag: true,
          },
        };
        eventDispatchService.trackApiComplete(
          eventModel,
          httpResponse,
          315550800000,
          315550805000,
          httpRequest.url,
          httpRequest.method
        );
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });

      it('runs customDimensions functions if present', () => {
        const httpResponse = new HttpResponse<any>({ status: 200, body: { policies: ['10000000', '20000000'] } });
        const eventModel: any = {
          eventId: 'EVENT_HASH',
          eventValue: 0,
          customDimensions: {
            isAwesome: true,
            firstPolicy: (response: any) => response.body.policies[0],
          },
        };
        const expectedAction: any = {
          type: AnalyticsAction.API_COMPLETE_EVENT,
          payload: {
            eventModel: {
              eventId: 'EVENT_HASH',
              eventValue: 0,
              customDimensions: {
                isAwesome: true,
                firstPolicy: '10000000',
              },
            },
            eventLocation: mockLocation,
          },
          meta: {
            response: httpResponse,
            duration: 5000,
            apiEndpoint: httpRequest.url,
            httpStatus: '200',
            httpMethod: httpRequest.method,
            hasEventModelTag: true,
          },
        };
        eventDispatchService.trackApiComplete(
          eventModel,
          httpResponse,
          315550800000,
          315550805000,
          httpRequest.url,
          httpRequest.method
        );
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });
      it(`uses '-1001' for meta's httpStatus code when response is a TimeoutError`, () => {
        const error = {
          message: 'Timeout has occurred',
          name: 'TimeoutError',
          info: { meta: {}, seen: 0, lastValue: {} },
        };
        const eventModel: any = { eventId: 'EVENT_HASH', eventValue: 0, customDimensions: {} };
        const expectedAction: any = {
          type: AnalyticsAction.API_COMPLETE_EVENT,
          payload: {
            eventModel,
            eventLocation: mockLocation,
          },
          meta: {
            response: error,
            duration: 5000,
            apiEndpoint: httpRequest.url,
            httpStatus: '-1001',
            httpMethod: httpRequest.method,
            hasEventModelTag: true,
          },
        };
        eventDispatchService.trackApiComplete(
          eventModel,
          error,
          315550800000,
          315550805000,
          httpRequest.url,
          httpRequest.method
        );
        expect(mockEventBus.dispatch.calls.argsFor(0)[0]).toEqual(expectedAction);
      });
    });
  });
});
