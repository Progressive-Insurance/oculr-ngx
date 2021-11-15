/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Injectable } from '@angular/core';
import { ConsoleService } from '../destinations/console/console.service';
import { SplunkService } from '../destinations/splunk/splunk.service';

@Injectable()
export class InitializationService {
  constructor(private console: ConsoleService, private splunk: SplunkService) {}

  init(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.console.init();
      this.splunk.init();
      resolve();
    });
  }
}
