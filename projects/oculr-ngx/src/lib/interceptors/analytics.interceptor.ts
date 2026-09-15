/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, take, tap } from 'rxjs/operators';
import { AppConfiguration } from '../models/app-configuration.interface';
import { ApiEventContext } from '../models/api-event-context.interface';
import { ConfigurationService } from '../services/configuration.service';
import { DispatchService } from '../services/dispatch.service';
import { TimeService } from '../services/time.service';

export const API_EVENT_CONTEXT = new HttpContextToken(() => {
  return { start: {}, success: {}, failure: {} };
});

@Injectable()
export class AnalyticsInterceptor implements HttpInterceptor {
  constructor(
    private dispatchService: DispatchService,
    private timeService: TimeService,
    private configService: ConfigurationService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Read the current config synchronously (appConfig$ is a BehaviorSubject, so
    // take(1) yields the current value immediately). We no longer queue requests
    // made before the config is loaded: that queue was only drained once
    // destinations existed, so with no destinations configured it grew without
    // bound, and in-flight responses that arrived after the drain lost their
    // complete events. The config is loaded synchronously at app initialization
    // (before any HTTP activity), so reading it live here is safe.
    return this.configService.appConfig$.pipe(
      take(1),
      switchMap((config: AppConfiguration) => {
        if (!config.destinations || !config.logHttpTraffic) {
          return next.handle(request);
        }

        const excludedUrls = config.destinations.map((dest) => dest.endpoint || '');

        if (this.isUrlIncluded(request, excludedUrls)) {
          const requestStartTime = this.timeService.now();
          const { start, success, failure } = request.context.get<ApiEventContext>(API_EVENT_CONTEXT);

          this.dispatchService.trackApiStart(start, request);

          return next.handle(request).pipe(
            tap(
              (event: HttpEvent<unknown>) => {
                if (event instanceof HttpResponse) {
                  const requestEndTime = this.timeService.now();
                  const duration = Math.round(requestEndTime - requestStartTime);

                  this.dispatchService.trackApiComplete(success, event, request, duration);
                }
              },
              (error: unknown) => {
                if (error instanceof HttpErrorResponse) {
                  const requestEndTime = this.timeService.now();
                  const duration = Math.round(requestEndTime - requestStartTime);

                  this.dispatchService.trackApiComplete(failure, error, request, duration);
                }
              }
            )
          );
        }
        return next.handle(request);
      })
    );
  }

  private isUrlIncluded(request: HttpRequest<unknown>, excludedUrls: string[]): boolean {
    return !!request.url && !excludedUrls?.includes(request.url);
  }
}
