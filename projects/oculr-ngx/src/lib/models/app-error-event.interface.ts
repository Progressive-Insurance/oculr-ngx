/* 
Copyright (c) 2021 Progressive Casualty Insurance Company. All rights reserved.

Progressive-owned, no external contributions.
*/

import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';

export interface AppErrorEvent {
  error: Error;
  id?: string;
  eventType?: AnalyticEventType;
  location?: EventLocation;
  scopes?: [];
}
