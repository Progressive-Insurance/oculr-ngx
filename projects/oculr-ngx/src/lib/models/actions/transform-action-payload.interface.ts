/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { EVENT_TYPES } from '../../event-types';
import { SelectedItems } from '../selected-items.interface';
import { VariableData } from '../variable-data.interface';

export interface TransformActionPayload {
  eventId?: string;
  eventType?: EVENT_TYPES;
  eventModel?: any;
  customDimensions?: any;
  variableData?: VariableData;
  selectedItems?: SelectedItems;
  properties: {
    [key: string]: any;
  };
}
