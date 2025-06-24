/* 
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/ 
 
import { AnalyticEvent } from "./analytic-event.interface";
import { emptyAnalyticEventModel } from "./empty-analytic-event";

export const createAnalyticEvent = (event: Partial<AnalyticEvent>): AnalyticEvent => ({
  ...emptyAnalyticEventModel,
  ...event,
});
