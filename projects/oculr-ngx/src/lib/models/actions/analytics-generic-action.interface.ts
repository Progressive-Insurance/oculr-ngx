/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { StandardAction } from './standard-action.interface';
import { EventPayload } from '../event-payload.interface';

export interface AnalyticsGenericAction extends StandardAction {
  payload: EventPayload;
}
