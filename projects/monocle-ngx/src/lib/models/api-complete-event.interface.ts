import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';

export interface ApiCompleteEvent {
  response: HttpResponse<unknown> | HttpErrorResponse | TimeoutError;
  request: HttpRequest<unknown>;
  duration: number;
  id?: string;
  eventType?: AnalyticEventType;
  location?: EventLocation;
  // TODO: needs a new type, possible generics
  scopes?: [];
}
