/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';

export interface PageViewEvent {
  id?: string;
  eventType?: AnalyticEventType;
  location?: EventLocation;
  isModal?: boolean;
  // TODO: needs a new type, possible generics
  scopes?: [];
}
