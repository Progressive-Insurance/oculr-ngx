/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppConfiguration } from '../models/app-configuration.interface';

@Injectable()
export class ConfigurationService {
  private _appConfig$: BehaviorSubject<AppConfiguration>;
  appConfig$: Observable<AppConfiguration>;

  constructor() {
    this._appConfig$ = new BehaviorSubject({});
    this.appConfig$ = this._appConfig$.asObservable();
  }

  loadAppConfig(config: AppConfiguration): void {
    this._appConfig$.next(config);
  }
}
