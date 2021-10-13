import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';

import { AnalyticsInterceptor } from './analytics.interceptor';

describe('Analytics Interceptor', () => {
  let mockEventDispatcher: any;
  let mockHandler: any;
  let analyticsInterceptor: AnalyticsInterceptor;
  const emptyEventModel = 'NonAnalyticEvent';
  const mockTimeService = {
    now: () => 1,
  };

  beforeEach(() => {
    mockEventDispatcher = jasmine.createSpyObj('mockEventDispatcher', [
      'trackApiStart',
      'trackApiSuccess',
      'trackApiFailure',
      'trackApiComplete',
    ]);
    mockHandler = jasmine.createSpyObj('mockHandler', ['handle']);
    mockHandler.handle.and.callFake((request: any) => of(request));
    analyticsInterceptor = new AnalyticsInterceptor(mockEventDispatcher, mockTimeService);
    spyOn(analyticsInterceptor, 'getEmptyEventModel').and.returnValue(emptyEventModel as any);
  });
  it('passes request onto next handler', () => {
    const request = new HttpRequest('GET', 'http//localhost/api/policies', {});
    analyticsInterceptor.intercept(request, mockHandler);
    expect(mockHandler.handle).toHaveBeenCalledWith(request);
  });
  it('does not log calls to splunk', () => {
    const request = new HttpRequest('GET', 'http//localhost/splunkservices/v1/collectors/logs', {});
    analyticsInterceptor.intercept(request, mockHandler);
    expect(mockEventDispatcher.trackApiStart).not.toHaveBeenCalled();
  });
  describe('when a start model is not passed', () => {
    it('calls trackApiStart with a dummy model', () => {
      const params: any = {};
      const request = new HttpRequest('GET', 'http//localhost/api/policies', { params });
      analyticsInterceptor.intercept(request, mockHandler);
      expect(mockEventDispatcher.trackApiStart).toHaveBeenCalledTimes(1);
      expect(mockEventDispatcher.trackApiStart).toHaveBeenCalledWith(emptyEventModel, request);
    });
  });
  describe('when a start model is passed', () => {
    it('calls trackApiStart with that model', () => {
      const params: any = { apiAnalyticsModels: { start: { eventId: 'START_HASH' } } };
      const request = new HttpRequest('GET', 'http//localhost/api/policies', { params });
      analyticsInterceptor.intercept(request, mockHandler);
      expect(mockEventDispatcher.trackApiStart).toHaveBeenCalledTimes(1);
      expect(mockEventDispatcher.trackApiStart.calls.argsFor(0)[0].eventId).toBe('START_HASH');
    });
  });
  describe('when the api completes successfully', () => {
    beforeEach(() => {
      const response = new HttpResponse({ status: 200 });
      mockHandler.handle.and.callFake(() => {
        return of(response);
      });
    });
    it('does not call trackApiError', () => {
      const params: any = { apiAnalyticsModels: {} };
      const request = new HttpRequest('GET', 'http//localhost/policies', { params });
      analyticsInterceptor.intercept(request, mockHandler).subscribe();
      expect(mockEventDispatcher.trackApiFailure).not.toHaveBeenCalled();
    });
    describe('and a complete model was not passed', () => {
      it('calls trackApiComplete with a dummy model', () => {
        const params: any = { apiAnalyticsModels: {} };
        const request = new HttpRequest('GET', 'http//localhost/policies', { params });
        analyticsInterceptor.intercept(request, mockHandler).subscribe();
        expect(mockEventDispatcher.trackApiComplete).toHaveBeenCalledTimes(1);
        expect(mockEventDispatcher.trackApiComplete.calls.argsFor(0)[0]).toBe(emptyEventModel);
        expect(mockEventDispatcher.trackApiComplete.calls.argsFor(0)[6]).toBe(false);
      });
    });
    describe('and a complete model was passed', () => {
      it('calls trackApiComplete with that model', () => {
        const params: any = { apiAnalyticsModels: { complete: { eventId: 'COMPLETE_HASH' } } };
        const request = new HttpRequest('GET', 'http//localhost/policies', { params });
        analyticsInterceptor.intercept(request, mockHandler).subscribe();
        expect(mockEventDispatcher.trackApiComplete).toHaveBeenCalledTimes(1);
        expect(mockEventDispatcher.trackApiComplete.calls.argsFor(0)[0].eventId).toBe('COMPLETE_HASH');
        expect(mockEventDispatcher.trackApiComplete.calls.argsFor(0)[6]).toBe(true);
      });
    });
    describe('and a success model was not passed', () => {
      it('calls trackApiSuccess with a dummy model', () => {
        const params: any = { apiAnalyticsModels: {} };
        const request = new HttpRequest('GET', 'http//localhost/policies', { params });
        analyticsInterceptor.intercept(request, mockHandler).subscribe();
        expect(mockEventDispatcher.trackApiSuccess).toHaveBeenCalledTimes(1);
        expect(mockEventDispatcher.trackApiSuccess.calls.argsFor(0)[0]).toBe(emptyEventModel);
      });
    });
    describe('and a success model was passed', () => {
      it('calls trackApiSuccess with that model', () => {
        const params: any = { apiAnalyticsModels: { success: { eventId: 'SUCCESS_HASH' } } };
        const request = new HttpRequest('GET', 'http//localhost/policies', { params });
        analyticsInterceptor.intercept(request, mockHandler).subscribe();
        expect(mockEventDispatcher.trackApiSuccess).toHaveBeenCalledTimes(1);
        expect(mockEventDispatcher.trackApiSuccess.calls.argsFor(0)[0].eventId).toBe('SUCCESS_HASH');
      });
    });
    describe('and an empty model was passed', () => {
      it('calls trackApiComplete with hasEventModelTag set to false', () => {
        const params: any = {};
        const request = new HttpRequest('GET', 'http//localhost/policies', { params });
        analyticsInterceptor.intercept(request, mockHandler).subscribe();
        expect(mockEventDispatcher.trackApiComplete).toHaveBeenCalledTimes(1);
        expect(mockEventDispatcher.trackApiComplete.calls.argsFor(0)[6]).toBe(false);
      });
    });
  });
  describe('when the api errors', () => {
    beforeEach(() => {
      const response = new HttpErrorResponse({ status: 200 });
      mockHandler.handle.and.callFake(() => {
        return throwError(response);
      });
    });
    it('does not call trackApiSuccess', () => {
      const params: any = { apiAnalyticsModels: {} };
      const request = new HttpRequest('GET', 'http//localhost/policies', { params });
      analyticsInterceptor.intercept(request, mockHandler).subscribe({
        error: () => undefined,
      });
      expect(mockEventDispatcher.trackApiSuccess).not.toHaveBeenCalled();
    });
    describe('and a complete model was not passed', () => {
      it('calls trackApiComplete with a dummy model', () => {
        const params: any = { apiAnalyticsModels: {} };
        const request = new HttpRequest('GET', 'http//localhost/policies', { params });
        analyticsInterceptor.intercept(request, mockHandler).subscribe({
          error: () => undefined,
        });
        expect(mockEventDispatcher.trackApiComplete).toHaveBeenCalledTimes(1);
        expect(mockEventDispatcher.trackApiComplete.calls.argsFor(0)[0]).toBe(emptyEventModel);
        expect(mockEventDispatcher.trackApiComplete.calls.argsFor(0)[6]).toBe(false);
      });
    });
    describe('and a complete model was passed', () => {
      it('calls trackApiComplete with that model', () => {
        const params: any = { apiAnalyticsModels: { complete: { eventId: 'COMPLETE_HASH' } } };
        const request = new HttpRequest('GET', 'http//localhost/policies', { params });
        analyticsInterceptor.intercept(request, mockHandler).subscribe({
          error: () => undefined,
        });
        expect(mockEventDispatcher.trackApiComplete).toHaveBeenCalledTimes(1);
        expect(mockEventDispatcher.trackApiComplete.calls.argsFor(0)[0].eventId).toBe('COMPLETE_HASH');
        expect(mockEventDispatcher.trackApiComplete.calls.argsFor(0)[6]).toBe(true);
      });
    });
    describe('and an error model was not passed', () => {
      it('calls trackApiError with a dummy model', () => {
        const params: any = { apiAnalyticsModels: {} };
        const request = new HttpRequest('GET', 'http//localhost/policies', { params });
        analyticsInterceptor.intercept(request, mockHandler).subscribe({
          error: () => undefined,
        });
        expect(mockEventDispatcher.trackApiFailure).toHaveBeenCalledTimes(1);
        expect(mockEventDispatcher.trackApiFailure.calls.argsFor(0)[0]).toBe(emptyEventModel);
      });
    });
    describe('and an error model was passed', () => {
      it('calls trackApiError with that model', () => {
        const params: any = { apiAnalyticsModels: { error: { eventId: 'ERROR_HASH' } } };
        const request = new HttpRequest('GET', 'http//localhost/policies', { params });
        analyticsInterceptor.intercept(request, mockHandler).subscribe({
          error: () => undefined,
        });
        expect(mockEventDispatcher.trackApiFailure).toHaveBeenCalledTimes(1);
        expect(mockEventDispatcher.trackApiFailure.calls.argsFor(0)[0].eventId).toBe('ERROR_HASH');
      });
    });
  });
});
