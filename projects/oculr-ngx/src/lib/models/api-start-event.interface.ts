/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { HttpRequest } from '@angular/common/http';
import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';

export interface ApiStartEvent {
  request: HttpRequest<unknown>;
  id?: string;
  eventType?: AnalyticEventType;
  location?: EventLocation;
  // TODO: needs a new type, possible generics
  scopes?: [];
}
