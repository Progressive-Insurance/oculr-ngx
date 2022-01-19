/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { ApiContext } from './api-context.interface';

export interface ApiEventContext {
  start: ApiContext;
  success: ApiContext;
  failure: ApiContext;
}
