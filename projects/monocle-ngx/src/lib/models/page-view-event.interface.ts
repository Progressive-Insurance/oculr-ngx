import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';

export interface PageViewEvent {
  id?: string;
  eventType?: AnalyticEventType;
  location?: EventLocation;
  isModal?: boolean;
  customScope?: Record<string, unknown>;
  // TODO: needs a new type, possible generics
  predefinedScopes?: [];
}
