/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { AppConfiguration } from '../models/app-configuration.interface';
import { Destinations } from '../models/destinations.enum';
import { ConfigurationService } from './configuration.service';

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  beforeEach(() => (service = new ConfigurationService()));

  it('should allow an app config to be loaded on demand', () => {
    const expectedConfig: AppConfiguration = {
      logHttpTraffic: false,
      destinations: [{ name: Destinations.Console, sendCustomEvents: false }],
    };
    service.loadAppConfig(expectedConfig);
    service.appConfig$.subscribe((config: AppConfiguration) => {
      expect(config).toEqual(expectedConfig);
    });
  });
});
