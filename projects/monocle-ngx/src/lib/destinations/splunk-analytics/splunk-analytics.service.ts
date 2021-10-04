import { Inject, Injectable, InjectionToken, NgZone } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { catchError, tap, filter, ignoreElements, map, switchMap, withLatestFrom } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';

import { Transform } from '../../models/transform.interface';
import { StringSelector } from '../../models/string-selector.interface';
import { SplunkBasePayload } from '../../models/destinations/splunk-base-payload.interface';
import { StateProvider } from '../../models/state-provider.type';
import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { EventDispatchService } from '../../services/event-dispatch.service';

export const splunkAnalyticsApiKey = new InjectionToken('SplunkAnalyticsApiKey');
export const splunkAnalyticsEndpoint = new InjectionToken('SplunkAnalyticsEndpoint');

export const sanitize = (str: string): string => {
  const pattTabs = /(\\t)/g;
  const pattCaret = /\^/g;
  return str.replace(pattTabs, ' ')
    .replace(pattCaret, '');
};

export const SPLUNK_ANALYTICS_TRANSFORM_TOKEN = new InjectionToken<StateProvider>('Splunk Analytics Service Transform');
export const SPLUNK_ANALYTICS_SERVICE_STATE_TOKEN = new InjectionToken<Transform>('Splunk Analytics Service State ');

@Injectable()
export class SplunkAnalyticsService {

  constructor(
    private http: HttpClient,
    private zone: NgZone,
    private eventBus: AnalyticsEventBusService,
    private eventDispatchService: EventDispatchService,
    @Inject(splunkAnalyticsEndpoint) private getEndpoint: StringSelector,
    @Inject(splunkAnalyticsApiKey) private getApiKey: StringSelector,
    @Inject(SPLUNK_ANALYTICS_TRANSFORM_TOKEN) private transform: Transform,
    @Inject(SPLUNK_ANALYTICS_SERVICE_STATE_TOKEN) private appStateFn$: StateProvider
  ) { }

  log(event: SplunkBasePayload, appState: any): void {
    const state = appState;
    const headers = new HttpHeaders({
      rtds_key: this.getApiKey(state),
      'Content-Type': 'application/json',
      Accept: 'application/json'
    });
    const observable = this.http.post(this.getEndpoint(state),
      sanitize(JSON.stringify(event)),
      { headers }).pipe(
        catchError(err => {
          console.warn('Unable to reach Splunk destination', err);
          return EMPTY;
        })
      );
    observable.subscribe();
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
