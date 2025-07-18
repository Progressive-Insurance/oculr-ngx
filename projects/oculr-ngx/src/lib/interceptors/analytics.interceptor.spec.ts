/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { HttpContext, HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { fakeAsync, flush } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
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
    mockHttpHandler = jasmine.createSpyObj('mockHttpHandler', ['handle']);
    mockHttpHandler.handle.and.callFake((mockRequest: any) => of(mockRequest));

    mockEventDispatchService = jasmine.createSpyObj('mockEventDispatchService', ['trackApiStart', 'trackApiComplete']);
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

  describe('after construction', () => {
    it('should dequeue any intercepts once a config has been set', fakeAsync(() => {
      analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
        expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(1);
      });

      configSubject.next({
        logHttpTraffic: true,
        destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, endpoint: destinationUrl }],
      });
      flush();

      configSubject.subscribe(() => {
        expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(0);
      });
    }));
  });

  describe('intercept', () => {
    describe('when HTTP logging is off', () => {
      it('should just forward the request on', fakeAsync(() => {
        configSubject.next({
          logHttpTraffic: false,
          destinations: [{ name: Destinations.HttpApi, sendCustomEvents: false, endpoint: destinationUrl }],
        });
        analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
          expect(mockHttpHandler.handle).toHaveBeenCalledOnceWith(mockRequest);
        });
        flush();
      }));
    });

    describe('when no destinations are defined', () => {
      it('queues the request to be dispatched later', fakeAsync(() => {
        analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
          expect(analyticsInterceptor['queuedIntercepts'].length).toEqual(1);
        });
        flush();
      }));

      it('passes the request on', fakeAsync(() => {
        analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
          expect(mockHttpHandler.handle).toHaveBeenCalledOnceWith(mockRequest);
        });
        flush();
      }));
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

        it('passes the request on', fakeAsync(() => {
          analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
            expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockRequest);
          });
          flush();
        }));

        it('does not track the call', fakeAsync(() => {
          analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
            expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledTimes(0);
          });
          flush();
        }));
      });

      describe('when the request url is not excluded', () => {
        describe('when a start model is passed', () => {
          it('calls trackApiStart with that model', fakeAsync(() => {
            analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
              expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledWith(mockEventContext.start, mockRequest);
            });
            flush();
          }));
        });

        describe('when a start model is not passed', () => {
          it('calls trackApiStart with an empty model', fakeAsync(() => {
            mockRequest = new HttpRequest('GET', trackedUrl);
            analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
              expect(mockEventDispatchService.trackApiStart).toHaveBeenCalledWith({}, mockRequest);
            });
            flush();
          }));
        });

        it('passes the request on', fakeAsync(() => {
          analyticsInterceptor.intercept(mockRequest, mockHttpHandler).subscribe(() => {
            expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockRequest);
          });
          flush();
        }));

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
