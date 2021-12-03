/* 
Copyright (c) 2021 Progressive Casualty Insurance Company. All rights reserved.

Progressive-owned, no external contributions.
*/

import { ValidationErrors } from '@angular/forms';
import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';

export interface ValidationErrorEvent {
  validationErrors: ValidationErrors;
  id?: string;
  element?: string;
  eventType?: AnalyticEventType;
  location?: EventLocation;
  scopes?: [];
}
