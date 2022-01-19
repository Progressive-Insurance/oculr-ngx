/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
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
  // TODO: needs a new type, possible generics
  scopes?: [];
}
