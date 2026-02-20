/* 
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/ 

import { AnalyticEventType } from "./analytic-event-type.enum";
import { AnalyticEvent } from "./analytic-event.interface";
import { InteractionType } from "./interaction-type.enum";

export const emptyAnalyticEventModel: AnalyticEvent = {
  id: '',
  label: '',
  element: null,
  inputType: '',
  value: '',
  displayValue: '',
  eventType: AnalyticEventType.NONE,
  linkUrl: '',
  activatedRoute: undefined,
  location: undefined,
  interactionType: InteractionType.none,
  interactionDetail: undefined,
  scopes: [],
  response: undefined,
  request: undefined,
  duration: 0,
  error: undefined,
  validationErrors: undefined,
};
