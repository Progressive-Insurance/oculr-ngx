/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppConfiguration } from '../models/app-configuration.interface';

@Injectable()
export class ConfigurationService {
  private _appConfig$: BehaviorSubject<AppConfiguration>;
  appConfig$: Observable<AppConfiguration>;

  constructor() {
    this._appConfig$ = new BehaviorSubject<AppConfiguration>({ logHttpTraffic: false });
    this.appConfig$ = this._appConfig$.asObservable();
  }

  loadAppConfig(config: AppConfiguration): void {
    this._appConfig$.next(config);
  }
}
