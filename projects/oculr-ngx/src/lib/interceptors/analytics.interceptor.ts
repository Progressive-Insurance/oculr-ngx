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
import { switchMap, take, tap } from 'rxjs/operators';
import { ApiEventContext } from '../models/api-event-context.interface';
import { AppConfiguration } from '../models/app-configuration.interface';
import { ConfigurationService } from '../services/configuration.service';
import { EventDispatchService } from '../services/event-dispatch.service';
import { TimeService } from '../services/time.service';

export const API_EVENT_CONTEXT = new HttpContextToken(() => {
  return { start: {}, success: {}, failure: {} };
});

@Injectable()
export class AnalyticsInterceptor implements HttpInterceptor {
  constructor(
    private eventDispatchService: EventDispatchService,
    private timeService: TimeService,
    private configService: ConfigurationService
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.configService.appConfig$.pipe(
      take(1),
      switchMap((config: AppConfiguration) => {
        if (config.destinations) {
          const excludedUrls = config.destinations?.map((dest) => dest.endpoint || '') || [];

          if (request.url && !excludedUrls?.includes(request.url)) {
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
        return next.handle(request);
      })
    );
  }
}
