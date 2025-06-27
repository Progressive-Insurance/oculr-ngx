/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { DestinationConfig } from './destination-config.interface';

export interface AppConfiguration {
  logHttpTraffic: boolean;
  destinations?: DestinationConfig[];
  applicationName?: string;
}
