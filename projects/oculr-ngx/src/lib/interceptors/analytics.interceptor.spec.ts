/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
 */

import { HttpContext, HttpErrorResponse, HttpEvent, HttpRequest, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { ApiEventContext } from '../models/api-event-context.interface';
import { Destinations } from '../models/destinations.enum';
import { AnalyticsInterceptor, API_EVENT_CONTEXT } from './analytics.interceptor';

describe('Analytics Interceptor', () => {
  const destinationUrl = 'https://prog.com/analytics';
  const trackedUrl = 'https://oso-web/headlines';

  let configSubject: BehaviorSubject<any>;
  let mockHttpHandler: any;
  let mockRequest: HttpRequest<any>;
  let mockEventContext: ApiEventContext;

  let mockEventDispatchService: any;
  let mockTimeService: any;
  let mockConfigService: any;
  let analyticsInterceptor: AnalyticsInterceptor;

  beforeEach(() => {
    mockEventContext = { start: { id: 'start' }, success: { id: 'success' }, failure: { id: 'failure' } };
    mockRequest = new HttpRequest('GET', trackedUrl, {
      context: new HttpContext().set(API_EVENT_CONTEXT, mockEventContext),
    });
    mockHttpHandler = {
      handle: vi.fn().mockName('mockHttpHandler.handle'),
    };
    mockHttpHandler.handle.mockImplementation((mockRequest: any) => of(mockRequest));

    mockEventDispatchService = {
      trackApiStart: vi.fn().mockName('mockEventDispatchService.trackApiStart'),
      trackApiComplete: vi.fn().mockName('mockEventDispatchService.trackApiComplete'),
    };
    mockTimeService = {
      now: () => 1,
    };
    configSubject = new BehaviorSubject({});
    mockConfigService = {
      appConfig$: configSubject,
    };
    analyticsInterceptor = new AnalyticsInterceptor(mockEventDispatchService, mockTimeService, mockConfigService);
    configSubject.next({ logHttpTraffic: true });
  });

  describe('API_EVENT_CONTEXT defaults', () => {
    it('assigns each HttpContext its own default start/success/failure objects', () => {
      const first = new HttpContext().get(API_EVENT_CONTEXT);
      const second = new HttpContext().get(API_EVENT_CONTEXT);

      expect(first.start).toEqual({});
      expect(first.success).toEqual({});
      expect(first.failure).toEqual({});
      expect(second.start).toEqual({});
      expect(second.success).toEqual({});
      expect(second.failure).toEqual({});
      expect(first.start).not.toBe(second.start);
      expect(first.success).not.toBe(second.success);
      expect(first.failure).not.toBe(second.failure);
    });

    it('dispatches independent start models for separate requests without a context', () => {
      const requestA = new HttpRequest('GET', trackedUrl);
      const requestB = new HttpRequest('GET', trackedUrl);
      configSubject.next({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, endpoint: destinationUrl }],
      });

      analyticsInterceptor.intercept(requestA, mockHttpHandler).subscribe();
      analyticsInterceptor.intercept(requestB, mockHttpHandler).subscribe();

      expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledTimes(2);
      const firstStart = mockEventDispatchService.trackApiStart.mock.calls[0][0];
      const secondStart = mockEventDispatchService.trackApiStart.mock.calls[1][0];
      expect(firstStart).toEqual({});
      expect(secondStart).toEqual({});
      expect(firstStart).not.toBe(secondStart);
    });
  });

  describe('after construction', () => {
    it('should dequeue any intercepts once a config has been set', () => {
      vi.useFakeTimers();
      analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
        expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(1);
      });

      configSubject.next({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, endpoint: destinationUrl }],
      });

      configSubject.subscribe(() => {
        expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(0);
      });
      vi.useRealTimers();
    });
  });

  describe('when a request starts before configuration', () => {
    let backend: Subject<HttpEvent<unknown>>;
    let now: number;

    beforeEach(() => {
      configSubject = new BehaviorSubject({ logHttpTraffic: false });
      mockConfigService = {
        appConfig$: configSubject,
      };
      now = 1000;
      mockTimeService = {
        now: () => now,
      };
      analyticsInterceptor = new AnalyticsInterceptor(mockEventDispatchService, mockTimeService, mockConfigService);
      backend = new Subject<HttpEvent<unknown>>();
      mockHttpHandler.handle.mockImplementation(() => backend.asObservable());
    });

    const publishConfigured = (logHttpTraffic: boolean, endpoint?: string) => {
      configSubject.next({
        logHttpTraffic,
        destinations: [{ name: Destinations.Console, sendCustomEvents: false, endpoint }],
      });
    };

    it('dispatches the start and completion when the response arrives after configuration', () => {
      const response = new HttpResponse({ status: 200 });
      let received: HttpEvent<unknown> | undefined;

      analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe({
        next: (event: HttpEvent<unknown>) => {
          received = event;
        },
      });

      expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1);
      expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockRequest);
      expect(mockEventDispatchService.trackApiStart).not.toHaveBeenCalled();
      expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(1);

      publishConfigured(true);

      expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledWith(mockEventContext.start, mockRequest);

      now = 1042;
      backend.next(response);
      backend.complete();

      expect(received).toBe(response);
      expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledWith(
        mockEventContext.success,
        response,
        mockRequest,
        42,
      );
      expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(0);
    });

    it('dispatches the start and completion when the error arrives after configuration', () => {
      const error = new HttpErrorResponse({ status: 500 });
      let receivedError: unknown;

      analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe({
        error: (err: unknown) => {
          receivedError = err;
        },
      });

      publishConfigured(true);

      expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledWith(mockEventContext.start, mockRequest);

      now = 1042;
      backend.error(error);

      expect(receivedError).toBe(error);
      expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledWith(
        mockEventContext.failure,
        error,
        mockRequest,
        42,
      );
      expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(0);
    });

    it('still dispatches the start then completion when the response arrives before configuration', () => {
      const response = new HttpResponse({ status: 200 });

      analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe();

      now = 1042;
      backend.next(response);
      backend.complete();

      expect(mockEventDispatchService.trackApiStart).not.toHaveBeenCalled();
      expect(mockEventDispatchService.trackApiComplete).not.toHaveBeenCalled();
      expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(2);

      publishConfigured(true);

      expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledWith(mockEventContext.start, mockRequest);
      expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledTimes(1);
      expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledWith(
        mockEventContext.success,
        response,
        mockRequest,
        42,
      );
      expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(0);
    });

    it('discards the buffered start and later completion when logging is disabled by the first resolved configuration', () => {
      const response = new HttpResponse({ status: 200 });

      analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe();

      publishConfigured(false);

      now = 1042;
      backend.next(response);
      backend.complete();

      expect(mockEventDispatchService.trackApiStart).not.toHaveBeenCalled();
      expect(mockEventDispatchService.trackApiComplete).not.toHaveBeenCalled();
      expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(0);
    });

    it('produces no events for a request to an excluded destination', () => {
      const excludedRequest = new HttpRequest('GET', destinationUrl, {
        context: new HttpContext().set(API_EVENT_CONTEXT, mockEventContext),
      });
      const response = new HttpResponse({ status: 200 });

      analyticsInterceptor.intercept(excludedRequest, mockHttpHandler).subscribe();

      publishConfigured(true, destinationUrl);

      now = 1042;
      backend.next(response);
      backend.complete();

      expect(mockEventDispatchService.trackApiStart).not.toHaveBeenCalled();
      expect(mockEventDispatchService.trackApiComplete).not.toHaveBeenCalled();
      expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(0);
    });
  });

  describe('intercept', () => {
    describe('when HTTP logging is off', () => {
      it('should just forward the request on', async () => {
        vi.useFakeTimers();
        configSubject.next({
          logHttpTraffic: false,
          destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, endpoint: destinationUrl }],
        });
        analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
          expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1);
          expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockRequest);
        });
        await vi.runAllTimersAsync();
        vi.useRealTimers();
      });
    });

    describe('when no destinations are defined', () => {
      it('queues the request to be dispatched later', async () => {
        vi.useFakeTimers();
        analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
          expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(1);
        });
        await vi.runAllTimersAsync();
        vi.useRealTimers();
      });

      it('passes the request on', async () => {
        vi.useFakeTimers();
        analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
          expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1);
          expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockRequest);
        });
        await vi.runAllTimersAsync();
        vi.useRealTimers();
      });
    });

    describe('when a destination is defined', () => {
      beforeEach(() => {
        configSubject.next({
          logHttpTraffic: true,
          destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, endpoint: destinationUrl }],
        });
      });

      describe('when the request url is excluded', () => {
        beforeEach(() => {
          mockRequest = new HttpRequest('GET', destinationUrl, {
            context: new HttpContext().set(API_EVENT_CONTEXT, mockEventContext),
          });
        });

        it('passes the request on', async () => {
          vi.useFakeTimers();
          analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
            expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockRequest);
          });
          await vi.runAllTimersAsync();
          vi.useRealTimers();
        });

        it('does not track the call', async () => {
          vi.useFakeTimers();
          analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
            expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledTimes(0);
          });
          await vi.runAllTimersAsync();
          vi.useRealTimers();
        });
      });

      describe('when the request url is not excluded', () => {
        describe('when a start model is passed', () => {
          it('calls trackApiStart with that model', async () => {
            vi.useFakeTimers();
            analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
              expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledWith(mockEventContext.start, mockRequest);
            });
            await vi.runAllTimersAsync();
            vi.useRealTimers();
          });
        });

        describe('when a start model is not passed', () => {
          it('calls trackApiStart with an empty model', async () => {
            vi.useFakeTimers();
            mockRequest = new HttpRequest('GET', trackedUrl);
            analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
              expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledWith({}, mockRequest);
            });
            await vi.runAllTimersAsync();
            vi.useRealTimers();
          });
        });

        it('passes the request on', async () => {
          vi.useFakeTimers();
          analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
            expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockRequest);
          });
          await vi.runAllTimersAsync();
          vi.useRealTimers();
        });

        describe('when the api completes successfully', () => {
          let mockResponse: any;

          beforeEach(() => {
            mockResponse = new HttpResponse({ status: 200 });
            mockHttpHandler.handle.mockImplementation(() => {
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
                0,
              );
            });
          });

          describe('and a success model was not passed', () => {
            it('calls trackApiComplete with an empty model', () => {
              mockRequest = new HttpRequest('GET', trackedUrl);
              analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe();
              expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledWith({}, mockResponse, mockRequest, 0);
            });
          });
        });

        describe('when the api errors', () => {
          let mockResponse: any;

          beforeEach(() => {
            mockResponse = new HttpErrorResponse({ status: 500 });
            mockHttpHandler.handle.mockImplementation(() => {
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
                0,
              );
            });
          });

          describe('and a failure model was not passed', () => {
            it('calls trackApiComplete with an empty model', () => {
              mockRequest = new HttpRequest('GET', trackedUrl);
              analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe({
                error: () => undefined,
              });
              expect(mockEventDispatchService.trackApiComplete).toHaveBeenCalledWith({}, mockResponse, mockRequest, 0);
            });
          });
        });
      });
    });
  });
});
