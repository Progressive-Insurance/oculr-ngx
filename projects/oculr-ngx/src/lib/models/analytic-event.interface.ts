/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';
import { ValidationErrors } from '@angular/forms';
import { ActivatedRouteSnapshot } from '@angular/router';
import { TimeoutError } from 'rxjs';
import { AnalyticEventType } from './analytic-event-type.enum';
import { EventLocation } from './event-location.interface';
import { InteractionDetail } from './interaction-detail.enum';
import { InteractionType } from './interaction-type.enum';

export interface AnalyticEvent {
  id?: string;
  label?: string;
  element?: string | number | null;
  inputType?: string;
  value?: any;
  displayValue?: string;
  eventType?: AnalyticEventType;
  linkUrl?: string;
  activatedRoute?: ActivatedRouteSnapshot;
  location?: EventLocation;
  interactionType?: InteractionType;
  interactionDetail?: InteractionDetail;
  scopes?: any[];
  response?: HttpResponse<unknown> | HttpErrorResponse | TimeoutError;
  request?: HttpRequest<unknown>;
  duration?: number;
  error?: Error;
  validationErrors?: ValidationErrors;
}
