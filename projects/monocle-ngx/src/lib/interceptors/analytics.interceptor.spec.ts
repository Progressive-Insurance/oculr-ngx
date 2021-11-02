import { HttpContext, HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ApiEventContext } from '../models/api-event-context.interface';

import { AnalyticsInterceptor, API_EVENT_CONTEXT } from './analytics.interceptor';

describe('Analytics Interceptor', () => {
  let mockEventDispatchService: any;
  let mockTimeService: any;
  let analyticsInterceptor: AnalyticsInterceptor;

  beforeEach(() => {
    mockEventDispatchService = jasmine.createSpyObj('mockEventDispatchService', ['trackApiStart', 'trackApiComplete']);
    mockTimeService = {
      now: () => 1,
    };
    analyticsInterceptor = new AnalyticsInterceptor(mockEventDispatchService, mockTimeService);
  });

  describe('intercept', () => {
    let mockHttpHandler: any;
    let mockRequest: HttpRequest<any>;
    let mockEventContext: ApiEventContext;

    beforeEach(() => {
      mockHttpHandler = jasmine.createSpyObj('mockHttpHandler', ['handle']);
      mockHttpHandler.handle.and.callFake((mockRequest: any) => of(mockRequest));
      mockEventContext = { start: { id: 'start' }, success: { id: 'success' }, failure: { id: 'failure' } };
      mockRequest = new HttpRequest('GET', 'http//localhost/api/policies', {
        context: new HttpContext().set(API_EVENT_CONTEXT, mockEventContext),
      });
    });

    it('passes the request onto the next handler', () => {
      analyticsInterceptor.intercept(mockRequest, mockHttpHandler);
      expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockRequest);
    });

    it('does not log calls to splunk', () => {
      mockRequest = new HttpRequest('GET', 'http//localhost/splunkservices/v1/collectors/logs');
      analyticsInterceptor.intercept(mockRequest, mockHttpHandler);
      expect(mockEventDispatchService.trackApiStart).not.toHaveBeenCalled();
    });

    describe('when a start model is passed', () => {
      it('calls trackApiStart with that model', () => {
        analyticsInterceptor.intercept(mockRequest, mockHttpHandler);
        expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledWith(mockEventContext.start, mockRequest);
      });
    });

    describe('when a start model is not passed', () => {
      it('calls trackApiStart with an empty model', () => {
        mockRequest = new HttpRequest('GET', 'http//localhost/api/policies');
        analyticsInterceptor.intercept(mockRequest, mockHttpHandler);
        expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledWith({}, mockRequest);
      });
    });

    describe('when the api completes successfully', () => {
      let mockResponse: any;

      beforeEach(() => {
        mockResponse = new HttpResponse({ status: 200 });
        mockHttpHandler.handle.and.callFake(() => {
          return of(mockResponse);
        });
      });

      describe('and a success model was passed', () => {
        it('calls trackApiComplete with that model', () => {
          analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe();
          expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledWith(
            mockEventContext.success,
            mockResponse,
            mockRequest,
            0
          );
        });
      });

      describe('and a success model was not passed', () => {
        it('calls trackApiComplete with an empty model', () => {
          mockRequest = new HttpRequest('GET', 'http//localhost/policies');
          analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe();
          expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledWith({}, mockResponse, mockRequest, 0);
        });
      });
    });

    describe('when the api errors', () => {
      let mockResponse: any;

      beforeEach(() => {
        mockResponse = new HttpErrorResponse({ status: 500 });
        mockHttpHandler.handle.and.callFake(() => {
          return throwError(mockResponse);
        });
      });

      describe('and a failure model was passed', () => {
        it('calls trackApiComplete with that model', () => {
          analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe({
            error: () => undefined,
          });
          expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledWith(
            mockEventContext.failure,
            mockResponse,
            mockRequest,
            0
          );
        });
      });

      describe('and a failure model was not passed', () => {
        it('calls trackApiComplete with an empty model', () => {
          mockRequest = new HttpRequest('GET', 'http//localhost/policies');
          analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe({
            error: () => undefined,
          });
          expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledWith({}, mockResponse, mockRequest, 0);
        });
      });
    });
  });
});
