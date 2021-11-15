/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { GoogleTagManagerEventCorePayload } from './google-tag-manager-event-core-payload.interface';

export type GoogleTagManagerEventPayload = GoogleTagManagerEventCorePayload & { [customDimension: string]: string };
