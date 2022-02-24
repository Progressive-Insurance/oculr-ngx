/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/progressive-insurance/oculr-ngx/blob/main/LICENSE.md
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
