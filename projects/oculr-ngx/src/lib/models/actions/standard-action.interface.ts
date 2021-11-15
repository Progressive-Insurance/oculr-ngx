/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

// Flux Standard Action
export interface StandardAction {
  type: string;
  payload?: any;
  error?: boolean;
  meta?: any;
}
