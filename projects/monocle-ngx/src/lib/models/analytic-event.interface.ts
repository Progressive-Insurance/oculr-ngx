import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';
import { InteractionDetail } from './interaction-detail.enum';
import { InteractionType } from './interaction-type.enum';

export interface AnalyticEvent {
  id?: string;
  label?: string;
  eventType?: AnalyticEventType;
  linkUrl?: string;
  location?: EventLocation;
  interactionType?: InteractionType;
  interactionDetail?: InteractionDetail;
  customScope?: Record<string, unknown>;
  // TODO: needs a new type, possible generics
  predefinedScopes?: [];
}
