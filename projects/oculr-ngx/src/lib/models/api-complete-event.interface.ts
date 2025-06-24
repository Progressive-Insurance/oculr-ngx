/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

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
  scopes?: any[];
}
