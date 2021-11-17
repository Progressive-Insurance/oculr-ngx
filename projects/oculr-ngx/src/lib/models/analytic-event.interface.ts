/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';
import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';
import { InputType } from './input-type.enum';
import { InteractionDetail } from './interaction-detail.enum';
import { InteractionType } from './interaction-type.enum';

export interface AnalyticEvent {
  id?: string;
  label?: string;
  inputType?: InputType;
  value?: string;
  displayValue?: string;
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
