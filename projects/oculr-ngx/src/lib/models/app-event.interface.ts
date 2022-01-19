/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';

export interface AppEvent {
  id?: string;
  eventType?: AnalyticEventType;
  location?: EventLocation;
  scopes?: [];
}
