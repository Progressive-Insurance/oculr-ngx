/* 
Copyright (c) 2021 Progressive Casualty Insurance Company. All rights reserved.

Progressive-owned, no external contributions.
*/

import { AppConfiguration } from '../models/app-configuration.interface';
import { Destinations } from '../models/destinations.enum';
import { ConfigurationService } from './configuration.service';

describe('ConfigurationService', () => {
  let service: ConfigurationService;

  beforeEach(() => (service = new ConfigurationService()));

  it('should allow an app config to be loaded on demand', () => {
    const expectedConfig: AppConfiguration = {
      destinations: [{ name: Destinations.Console, sendCustomEvents: false }],
    };
    service.loadAppConfig(expectedConfig);
    service.appConfig$.subscribe((config: AppConfiguration) => {
      expect(config).toEqual(expectedConfig);
    });
  });
});
