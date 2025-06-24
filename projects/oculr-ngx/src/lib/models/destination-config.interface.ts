/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { HttpHeaders } from '@angular/common/http';
import { Destinations } from './destinations.enum';

export interface DestinationConfig {
  name: Destinations;
  sendCustomEvents: boolean;
  endpoint?: string;
  method?: 'POST' | 'PUT';
  headers?: HttpHeaders;
}
