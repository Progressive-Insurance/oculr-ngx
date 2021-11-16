/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { HttpContext, HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { fakeAsync, flush } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ApiEventContext } from '../models/api-event-context.interface';
import { Destinations } from '../models/destinations.enum';
import { AnalyticsInterceptor, API_EVENT_CONTEXT } from './analytics.interceptor';

describe('Analytics Interceptor', () => {
  const destinationUrl = 'https://prog.com/analytics';

  let mockEventDispatchService: any;
  let mockTimeService: any;
  let mockConfigService: any;
  let analyticsInterceptor: AnalyticsInterceptor;

  beforeEach(() => {
    mockEventDispatchService = jasmine.createSpyObj('mockEventDispatchService', ['trackApiStart', 'trackApiComplete']);
    mockTimeService = {
      now: () => 1,
    };
    mockConfigService = {
      appConfig$: of({
        destinations: [{ name: Destinations.Splunk, sendCustomEvents: false, endpoint: destinationUrl }],
      }),
    };
    analyticsInterceptor = new AnalyticsInterceptor(mockEventDispatchService, mockTimeService, mockConfigService);
  });

  describe('intercept', () => {
    const trackedUrl = 'https://oso-web/headlines';
    let mockHttpHandler: any;
    let mockRequest: HttpRequest<any>;
    let mockEventContext: ApiEventContext;

    beforeEach(() => {
      mockHttpHandler = jasmine.createSpyObj('mockHttpHandler', ['handle']);
      mockHttpHandler.handle.and.callFake((mockRequest: any) => of(mockRequest));
      mockEventContext = { start: { id: 'start' }, success: { id: 'success' }, failure: { id: 'failure' } };
      mockRequest = new HttpRequest('GET', trackedUrl, {
        context: new HttpContext().set(API_EVENT_CONTEXT, mockEventContext),
      });
    });

    describe('when no destinations are defined', () => {
      beforeEach(() => {
        mockConfigService = { appConfig$: of({}) };
        analyticsInterceptor = new AnalyticsInterceptor(mockEventDispatchService, mockTimeService, mockConfigService);
      });

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
