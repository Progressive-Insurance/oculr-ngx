/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

export interface DisplayEvent {
  id: string;
  label?: string;
  // TODO: needs a new type, possible generics
  scopes?: [];
}
