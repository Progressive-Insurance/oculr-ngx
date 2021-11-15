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
