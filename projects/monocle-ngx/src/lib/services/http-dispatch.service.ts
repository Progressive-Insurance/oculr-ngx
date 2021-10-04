import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { HttpDispatchRequest } from '../models/http-dispatch-request.interface';
import { HttpDispatchRequestOptions } from '../models/http-dispatch-request-options.interface';
import { onStart, onSuccess, onError, onCompleted } from '../actions/http-dispatch.actions';
import { AnalyticsService } from './analytics.service';
import { TimeService } from './time.service';

type HttpDispatchRequestOrOptions = HttpDispatchRequest | HttpDispatchRequestOptions;

const isHttpDispatchRequest = (requestOrOptions: HttpDispatchRequestOrOptions) => {
  return typeof (requestOrOptions as HttpDispatchRequest).start === 'function';
};

export function createRequest(options: HttpDispatchRequestOptions) {
  const observableDispatchRequest: HttpDispatchRequest = {
    start: onStart(options),
    success: onSuccess(options),
    error: onError(options),
    completed: onCompleted(options)
  };
  return observableDispatchRequest;
}

const getHttpDispatchRequest = (requestOrOptions: HttpDispatchRequestOrOptions) => {
  return isHttpDispatchRequest(requestOrOptions)
    ? requestOrOptions as HttpDispatchRequest
    : createRequest(requestOrOptions);
};

/**
 * Class for dispatching on observable events.
 */
@Injectable()
export class HttpDispatchService {

  static readonly createRequest = createRequest;

  constructor(private analytics: AnalyticsService, private timeService: TimeService) { }

  /**
   * Dispatch API Tracking events for an Angular Http Request.
   */
  dispatchObservable = <T>(
    observable: Observable<T>,
    requestOrOptions: HttpDispatchRequest | HttpDispatchRequestOptions,
    meta: any = {}
  ): Observable<T> => {
    const request = getHttpDispatchRequest(requestOrOptions);
    const { start, success, completed, error } = request;
    const requestStartTime = this.timeService.now();

    this.analytics.track(start(requestStartTime, meta));

    return observable.pipe(tap(
      response => {
        const requestEndTime = this.timeService.now();

        this.analytics.track(success(response, meta, requestStartTime, requestEndTime));
        this.analytics.track(completed(response, meta, requestStartTime, requestEndTime));
      },
      err => {
        const requestEndTime = this.timeService.now();

        this.analytics.track(error(err, meta, requestStartTime, requestEndTime));
        this.analytics.track(completed(err, meta, requestStartTime, requestEndTime));
      }
    ));

  }
}
