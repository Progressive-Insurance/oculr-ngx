/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { ApiContext } from '../models/api-context.interface';
import { ApiEventContext } from '../models/api-event-context.interface';
import { AppConfiguration } from '../models/app-configuration.interface';
import { ConfigurationService } from '../services/configuration.service';
import { EventDispatchService } from '../services/event-dispatch.service';
import { TimeService } from '../services/time.service';

export const API_EVENT_CONTEXT = new HttpContextToken(() => {
  return { start: {}, success: {}, failure: {} };
});

interface QueuedIntercept {
  context: ApiContext;
  request: HttpRequest<unknown>;
  response?: HttpResponse<unknown> | HttpErrorResponse;
  duration?: number;
}

@Injectable()
export class AnalyticsInterceptor implements HttpInterceptor {
  private queuedIntercepts: QueuedIntercept[] = [];

  constructor(
    private eventDispatchService: EventDispatchService,
    private timeService: TimeService,
    private configService: ConfigurationService
  ) {
    this.configService.appConfig$
      .pipe(
        filter((config: AppConfiguration) => !!config.destinations),
        take(1),
        tap((config: AppConfiguration) => {
          const excludedUrls = config.destinations?.map((dest) => dest.endpoint || '') || [];
          this.dequeueIntercepts(excludedUrls);
        })
      )
      .subscribe();
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.configService.appConfig$.pipe(
      take(1),
      switchMap((config: AppConfiguration) => {
        if (config.destinations) {
          const excludedUrls = config.destinations?.map((dest) => dest.endpoint || '') || [];

          if (this.isUrlIncluded(request, excludedUrls)) {
            const requestStartTime = this.timeService.now();
            const { start, success, failure } = request.context.get<ApiEventContext>(API_EVENT_CONTEXT);

            this.eventDispatchService.trackApiStart(start, request);

            return next.handle(request).pipe(
              tap(
                (event: HttpEvent<unknown>) => {
                  if (event instanceof HttpResponse) {
                    const requestEndTime = this.timeService.now();
                    const duration = Math.round(requestEndTime - requestStartTime);

                    this.eventDispatchService.trackApiComplete(success, event, request, duration);
                  }
                },
                (error: unknown) => {
                  if (error instanceof HttpErrorResponse) {
                    const requestEndTime = this.timeService.now();
                    const duration = Math.round(requestEndTime - requestStartTime);

                    this.eventDispatchService.trackApiComplete(failure, error, request, duration);
                  }
                }
              )
            );
          }
          return next.handle(request);
        }
        return this.queueIntercept(request, next);
      })
    );
  }

  private queueIntercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const requestStartTime = this.timeService.now();
    const { start, success, failure } = request.context.get<ApiEventContext>(API_EVENT_CONTEXT);

    this.queuedIntercepts.push({ context: start, request });

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<unknown>) => {
          if (event instanceof HttpResponse) {
            const requestEndTime = this.timeService.now();
            const duration = Math.round(requestEndTime - requestStartTime);

            this.queuedIntercepts.push({
              context: success,
              request,
              response: event,
              duration,
            });
          }
        },
        (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            const requestEndTime = this.timeService.now();
            const duration = Math.round(requestEndTime - requestStartTime);

            this.queuedIntercepts.push({
              context: failure,
              request,
              response: error,
              duration,
            });
          }
        }
      )
    );
  }

  private dequeueIntercepts(excludedUrls: string[]): void {
    while (this.queuedIntercepts.length > 0) {
      const intercept = this.queuedIntercepts.shift();

      if (intercept && this.isUrlIncluded(intercept?.request, excludedUrls)) {
        if (intercept.response) {
          this.eventDispatchService.trackApiComplete(
            intercept.context,
            intercept.response,
            intercept.request,
            intercept.duration || 0
          );
        } else {
          this.eventDispatchService.trackApiStart(intercept.context, intercept.request);
        }
      }
    }
  }

  private isUrlIncluded(request: HttpRequest<unknown>, excludedUrls: string[]): boolean {
    return !!request.url && !excludedUrls?.includes(request.url);
  }
}
