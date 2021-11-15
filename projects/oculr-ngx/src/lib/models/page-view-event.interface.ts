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
