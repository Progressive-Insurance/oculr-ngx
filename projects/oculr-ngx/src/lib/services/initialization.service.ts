/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { Injectable } from '@angular/core';
import { ConsoleService } from '../destinations/console/console.service';
import { HttpApiService } from '../destinations/http-api/http-api.service';

@Injectable()
export class InitializationService {
  constructor(private console: ConsoleService, private httpApi: HttpApiService) {}

  init(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.console.init();
      this.httpApi.init();
      resolve();
    });
  }
}
