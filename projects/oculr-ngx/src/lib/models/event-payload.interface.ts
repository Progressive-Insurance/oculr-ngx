/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { EventModel } from './event-model.class';
import { EventLocation } from './event-location.interface';

export interface EventPayload {
  // location - location parameter details
  eventLocation: EventLocation;
  // model - Event Model with all variable substitution completed
  eventModel: EventModel;
}
