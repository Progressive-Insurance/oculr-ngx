/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { ActivatedRouteSnapshot } from '@angular/router';
import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';

export interface PageViewEvent {
  id?: string;
  activatedRoute?: ActivatedRouteSnapshot;
  eventType?: AnalyticEventType;
  location?: EventLocation;
  scopes?: any[];
}
