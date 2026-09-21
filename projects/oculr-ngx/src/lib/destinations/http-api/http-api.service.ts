/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { asapScheduler, EMPTY, Observable, throwError, timer } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  ignoreElements,
  map,
  mergeMap,
  retryWhen,
  switchMap,
  tap,
} from 'rxjs/operators';
import { AppConfiguration } from '../../models/app-configuration.interface';
import { DestinationConfig } from '../../models/destination-config.interface';
import { Destinations } from '../../models/destinations.enum';
import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { ConfigurationService } from '../../services/configuration.service';

type SubscriptionMode = 'disabled' | 'standard' | 'custom';

@Injectable()
export class HttpApiService {
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
        tap((config: AppConfiguration) => {
          const destination = config.destinations?.find((dest) => dest.name === Destinations.HttpApi);
          this.loadAndValidateConfig(destination);
        }),
        map((config: AppConfiguration) => this.deriveMode(config)),
        distinctUntilChanged(),
        switchMap((mode: SubscriptionMode) => {
          if (mode === 'disabled') {
            return EMPTY;
          }
          const eventPipe = mode === 'custom' ? this.eventBus.customEvents$ : this.eventBus.events$;
          return eventPipe.pipe(
            filter((event: unknown) => !!event),
            tap((event: unknown) => this.zone.runOutsideAngular(() => this.log(event))),
            ignoreElements()
          );
        })
      )
      .subscribe();
  }

  private deriveMode(config: AppConfiguration): SubscriptionMode {
    const destination = config.destinations?.find((dest) => dest.name === Destinations.HttpApi);
    // this.config is set by loadAndValidateConfig (run in the tap above) only when the
    // destination config is valid, so an invalid config yields the disabled mode.
    if (!destination || !this.config) {
      return 'disabled';
    }
    return destination.sendCustomEvents ? 'custom' : 'standard';
  }

  log(event: unknown): void {
    if (!this.config) {
      return;
    }
    const { method, endpoint, headers } = this.config;

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
            console.warn('Unable to reach destination', returnError);
            return EMPTY;
          })
        )
        .subscribe();
    }
  }

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
        console.warn('An endpoint is required to send events to this destination');
        this.config = undefined;
        return false;
      }
      if (!config.method) {
        console.warn('An HTTP method is required to send events to this destination');
        this.config = undefined;
        return false;
      }
      this.config = config;
      return true;
    }
    this.config = undefined;
    return false;
  }
}
