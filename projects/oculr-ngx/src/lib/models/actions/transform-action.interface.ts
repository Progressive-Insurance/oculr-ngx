/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { EVENT_TYPES } from '../../event-types';
import { AnalyticsAction } from './analytics-action.enum';
import { StandardAction } from './standard-action.interface';
import { TransformActionPayload } from './transform-action-payload.interface';

export interface TransformAction extends StandardAction {
  type: AnalyticsAction;
  payload: TransformActionPayload;
  meta?: {
    trackAs?: EVENT_TYPES; // FIXME incoming events shouldn't have trackAs
    [key: string]: any;
  };
  [key: string]: any;
}
