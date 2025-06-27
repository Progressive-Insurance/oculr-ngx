/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { ValidationErrors } from '@angular/forms';
import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';

export interface ValidationErrorEvent {
  validationErrors: ValidationErrors;
  id?: string;
  element?: string | number | null;
  eventType?: AnalyticEventType;
  location?: EventLocation;
  scopes?: any[];
}
