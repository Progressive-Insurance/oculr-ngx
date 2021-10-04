import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AnalyticsHttpParams } from '../models/analytics-http-params.class';
import { EventDispatchService } from '../services/event-dispatch.service';
import { getEmptyEventModel } from './constants';
import { TimeService } from '../services/time.service';

@Injectable()
export class AnalyticsInterceptor implements HttpInterceptor {

  constructor(private eventDispatchService: EventDispatchService, private timeService: TimeService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (request.url && !request.url.includes('splunkservices')) {
      const params = (request.params || {}) as AnalyticsHttpParams;
      const apiAnalyticsModels = params.apiAnalyticsModels || {};
      const emptyEventModel = getEmptyEventModel();
      const {
        start = emptyEventModel,
        success = emptyEventModel,
        error = emptyEventModel,
        complete = emptyEventModel
      } = apiAnalyticsModels;

      // TODO: Remove the hasEventModelTag logic after Analytics 1.0 has been fully deprecated
      const hasEventModelTag =
        (apiAnalyticsModels.start && apiAnalyticsModels.start.eventId) ||
        (apiAnalyticsModels.success && apiAnalyticsModels.success.eventId) ||
        (apiAnalyticsModels.error && apiAnalyticsModels.error.eventId) ||
        (apiAnalyticsModels.complete && apiAnalyticsModels.complete.eventId)
          ? true
          : false;

      const requestStartTime = this.timeService.now();
      this.eventDispatchService.trackApiStart(start, request);

      return next.handle(request).pipe(
        tap(
          (event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
              const requestEndTime = this.timeService.now();
              this.eventDispatchService.trackApiSuccess(success, event, requestStartTime, requestEndTime, request.url, request.method);
              this.eventDispatchService.trackApiComplete(
                complete,
                event,
                requestStartTime,
                requestEndTime,
                request.url,
                request.method,
                hasEventModelTag
              );
            }
          },
          (err: any) => {
            if (err instanceof HttpErrorResponse) {
              const requestEndTime = this.timeService.now();
              this.eventDispatchService.trackApiFailure(error, err, requestStartTime, requestEndTime, request.url, request.method);
              this.eventDispatchService.trackApiComplete(
                complete,
                err,
                requestStartTime,
                requestEndTime,
                request.url,
                request.method,
                hasEventModelTag
              );
            }
          }
        )
      );
    }
    return next.handle(request);
  }
}
