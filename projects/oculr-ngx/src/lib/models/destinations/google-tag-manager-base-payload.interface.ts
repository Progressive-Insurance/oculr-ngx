/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { GoogleTagManagerEvent } from './google-tag-manager-event.type';

/**
 * Base type for all GoogleTagManager Payloads.
 * Do not instantiate directly, use inheritted types
 */
export interface GoogleTagManagerBasePayload {
  domain: string;
  event: GoogleTagManagerEvent;
}
