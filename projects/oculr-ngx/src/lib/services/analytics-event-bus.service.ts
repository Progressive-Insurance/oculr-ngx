/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/progressive-insurance/oculr-ngx/blob/main/LICENSE.md
 */

import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
import { AnalyticEvent } from '../models/analytic-event.interface';

@Injectable()
export class AnalyticsEventBusService {
  readonly events$: Observable<AnalyticEvent>;
  readonly customEvents$: Observable<unknown>;
  private _events$: ReplaySubject<AnalyticEvent>;
  private _customEvents$: ReplaySubject<unknown>;

  constructor() {
    this._events$ = new ReplaySubject(25, 10000);
    this._customEvents$ = new ReplaySubject(25, 10000);
    this.events$ = this._events$.asObservable();
    this.customEvents$ = this._customEvents$.asObservable();
  }

  dispatch(event: AnalyticEvent): void {
    this._events$.next(event);
  }

  dispatchCustomEvent(event: unknown): void {
    this._customEvents$.next(event);
  }
}
