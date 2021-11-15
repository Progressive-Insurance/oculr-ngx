import { EventModel } from './event-model.class';
import { EventLocation } from './event-location.interface';

export interface EventPayload {
  // location - location parameter details
  eventLocation: EventLocation;
  // model - Event Model with all variable substitution completed
  eventModel: EventModel;
}
