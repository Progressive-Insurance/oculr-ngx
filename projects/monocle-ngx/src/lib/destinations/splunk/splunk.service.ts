import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { asapScheduler, EMPTY, Observable, throwError, timer } from 'rxjs';
import { catchError, filter, ignoreElements, map, mergeMap, retryWhen, switchMap, tap } from 'rxjs/operators';
import { AppConfiguration } from '../../models/app-configuration.interface';
import { DestinationConfig } from '../../models/destination-config.interface';
import { Destinations } from '../../models/destinations.enum';
import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { ConfigurationService } from '../../services/configuration.service';

@Injectable()
export class SplunkService {
  private config: DestinationConfig | undefined;

  constructor(
    private configuration: ConfigurationService,
    private eventBus: AnalyticsEventBusService,
    private zone: NgZone,
    private http: HttpClient
  ) {}

  init(): void {
    this.configuration.appConfig$
      .pipe(
        filter((config: AppConfiguration) => !!config),
        map((config: AppConfiguration) => config.destinations?.find((dest) => dest.name === Destinations.Splunk)),
        filter((config?: DestinationConfig) => this.loadAndValidateConfig(config)),
        switchMap(() => {
          const eventPipe = this.config?.sendCustomEvents ? this.eventBus.customEvents$ : this.eventBus.events$;
          return eventPipe.pipe(
            filter((event: unknown) => !!event),
            tap((event: unknown) => this.zone.runOutsideAngular(() => this.log(event))),
            ignoreElements()
          );
        })
      )
      .subscribe();
  }

  private log(event: unknown): void {
    const { method, endpoint, headers } = this.config as DestinationConfig;

    if (method && endpoint) {
      this.http
        .request(method, endpoint, { headers, body: event })
        .pipe(
          retryWhen(this.retryStrategy()),
          catchError((err: HttpErrorResponse) => {
            const returnError = {
              ...err,
              message: `Failed to ${method} to ${endpoint} : ${err.message}`,
            };
            console.warn('Unable to reach Splunk destination', returnError);
            return EMPTY;
          })
        )
        .subscribe();
    }
  }

  // TODO: Need to move default values to DestinationConfig (AppConfiguration?)
  private retryStrategy =
    (maxRetryAttempts = 3, scalingDuration = 1000, includedStatusCodes = [0]) =>
    (attempts: Observable<HttpErrorResponse>) => {
      return attempts.pipe(
        mergeMap((error: HttpErrorResponse, i: number) => {
          const retryAttempt = i + 1;
          if (
            retryAttempt > maxRetryAttempts ||
            includedStatusCodes.filter((code: number) => code === error.status).length === 0
          ) {
            return throwError(error);
          }
          return timer(retryAttempt * scalingDuration, asapScheduler);
        })
      );
    };

  private loadAndValidateConfig(config?: DestinationConfig): boolean {
    if (config) {
      if (!config.endpoint) {
        console.warn('An endpoint is required to send events to Splunk');
        return false;
      }
      if (!config.method) {
        console.warn('An HTTP method is required to send events to Splunk');
        return false;
      }
      this.config = config;
      return true;
    }
    return false;
  }
}
