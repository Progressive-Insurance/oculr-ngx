/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Injectable, InjectionToken, Inject } from '@angular/core';
import { tap, filter, ignoreElements, map, switchMap, catchError, withLatestFrom } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';

import { Transform } from '../../models/transform.interface';
import { StateProvider } from '../../models/state-provider.type';
import { GoogleTagManagerBasePayload } from '../../models/destinations/google-tag-manager-base-payload.interface';
import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { EventDispatchService } from '../../services/event-dispatch.service';
import { WindowService } from '../../services/window.service';

export const GOOGLE_TAG_MANAGER_STATE_TOKEN = new InjectionToken<StateProvider>('Google Tag Manager State');
export const GOOGLE_TAG_MANAGER_TRANSFORM_TOKEN = new InjectionToken<Transform>('Google Tag Manager Transform');

@Injectable()
export class GoogleTagManagerService {
  constructor(
    private window: WindowService,
    private eventBus: AnalyticsEventBusService,
    private eventDispatchService: EventDispatchService,
    @Inject(GOOGLE_TAG_MANAGER_STATE_TOKEN) private appStateFn$: StateProvider,
    @Inject(GOOGLE_TAG_MANAGER_TRANSFORM_TOKEN) private transform: Transform
  ) {
    if (typeof window.nativeWindow.dataLayer === 'undefined') {
      window.nativeWindow.dataLayer = [];
    }
  }

  log(event: GoogleTagManagerBasePayload) {
    this.window.nativeWindow.dataLayer.push(event);
    const clearEvent = Object.keys(event).reduce((acc: { [key: string]: any }, key) => {
      acc[key] = undefined;
      return acc;
    }, {});
    this.window.nativeWindow.dataLayer.push(clearEvent);
  }

  init() {
    this.eventBus.events$
      .pipe(
        withLatestFrom(this.appStateFn$()),
        switchMap(([inputAction, appState]) => {
          return of(inputAction).pipe(
            map((action) => this.transform(action, appState)),
            catchError((error) => {
              return EMPTY;
            })
          );
        }),
        filter((event) => !!event),
        tap((event) => this.log(event)),
        ignoreElements()
      )
      .subscribe();
  }
}
