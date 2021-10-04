import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, timer, throwError, of, Scheduler, asapScheduler, EMPTY } from 'rxjs';
import { catchError, tap, filter, ignoreElements, map, switchMap, retryWhen, mergeMap, withLatestFrom } from 'rxjs/operators';

import { Transform } from '../../models/transform.interface';
import { StringSelector } from '../../models/string-selector.interface';
import { CommonErrorSchema } from '../../models/common-error-schema.model';
import { StateProvider } from '../../models/state-provider.type';
import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { EventDispatchService } from '../../services/event-dispatch.service';

export const splunkStandardLoggingEndpoint = new InjectionToken('SplunkStandardLoggingEndpoint');
export const splunkStandardLoggingApiKey = new InjectionToken('SplunkStandardLoggingApiKey');
export const SPLUNK_STANDARD_LOGGING_TRANSFORM_TOKEN = new InjectionToken<StateProvider>('Splunk Standard Logging Service Transform');
export const SPLUNK_STANDARD_LOGGING_SERVICE_STATE_TOKEN = new InjectionToken<Transform>('Splunk Standard Logging Service State');

@Injectable()
export class SplunkStandardLoggingService {

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private eventBus: AnalyticsEventBusService,
    private eventDispatchService: EventDispatchService,
    @Inject(splunkStandardLoggingEndpoint) private getStandardLoggingEndpoint: StringSelector,
    @Inject(splunkStandardLoggingApiKey) private getStandardLoggingApiKey: StringSelector,
    @Inject(SPLUNK_STANDARD_LOGGING_TRANSFORM_TOKEN) private transform: Transform,
    @Inject(SPLUNK_STANDARD_LOGGING_SERVICE_STATE_TOKEN) private appStateFn$: StateProvider,
    private scheduler: Scheduler = asapScheduler
  ) { }

  log(event: CommonErrorSchema, appState: any): void {
    const state = appState;
    const headers = new HttpHeaders({
      api_key: this.getStandardLoggingApiKey(state),
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const observable = this.http.post(
      this.getStandardLoggingEndpoint(state),
      event,
      { headers }).pipe(
        retryWhen(this.retryStrategy()),
        catchError((err: HttpErrorResponse) => {
          const returnError = { ...err, message: `ERROR POST ${this.getStandardLoggingEndpoint(state)} : ${err.message}` };
          console.warn('Unable to reach Splunk destination', returnError);
          return EMPTY;
        })
      );
    observable.subscribe();
  }

  retryStrategy = ({
    maxRetryAttempts = 3,
    scalingDuration = 1000,
    includedStatusCodes = [0]
  }: {
    maxRetryAttempts?: number,
    scalingDuration?: number,
    includedStatusCodes?: number[]
  } = {}) => (attempts: Observable<any>) => {
    return attempts.pipe(
      mergeMap((error, i) => {
        const retryAttempt = i + 1;
        if (retryAttempt > maxRetryAttempts || includedStatusCodes.filter(e => e === error.status).length === 0) {
          return throwError(error);
        }
        return timer(retryAttempt * scalingDuration, this.scheduler);
      })
    );
  }

  init() {
    this.eventBus.events$.pipe(
      withLatestFrom(this.appStateFn$()),
      switchMap(([inputAction, appState]) => {
        return of(inputAction).pipe(
          map(action => ({ event: this.transform(action, appState), appState })),
          catchError(error => {
            this.eventDispatchService.trackAnalyticsError(error);
            return EMPTY;
          })
        );
      }),
      filter(({ event }) => !!event),
      tap(({ event, appState }) => this.zone.runOutsideAngular(() => this.log(event, appState))),
      ignoreElements()
    ).subscribe();
  }
}
