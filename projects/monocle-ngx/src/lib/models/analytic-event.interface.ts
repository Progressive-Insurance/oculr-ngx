import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
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
  // TODO: needs a new type, possible generics
  scopes?: [];
  response?: HttpResponse<unknown> | HttpErrorResponse | TimeoutError;
  request?: HttpRequest<unknown>;
  duration?: number;
}
