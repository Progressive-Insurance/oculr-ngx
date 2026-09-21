/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { Injectable, NgZone } from '@angular/core';
import { EMPTY } from 'rxjs';
import { distinctUntilChanged, filter, ignoreElements, map, switchMap, tap } from 'rxjs/operators';
import { AppConfiguration } from '../../models/app-configuration.interface';
import { Destinations } from '../../models/destinations.enum';
import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { ConfigurationService } from '../../services/configuration.service';

type SubscriptionMode = 'disabled' | 'standard' | 'custom';

@Injectable()
export class ConsoleService {
  constructor(
    private configuration: ConfigurationService,
    private eventBus: AnalyticsEventBusService,
    private zone: NgZone
  ) {}

  init(): void {
    this.configuration.appConfig$
      .pipe(
        filter((config: AppConfiguration) => !!config),
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
    const destination = config.destinations?.find((dest) => dest.name === Destinations.Console);
    if (!destination) {
      return 'disabled';
    }
    return destination.sendCustomEvents ? 'custom' : 'standard';
  }

  private log(event: unknown): void {
    console.log(event);
  }
}
