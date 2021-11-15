/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { GoogleTagManagerBasePayload } from './google-tag-manager-base-payload.interface';

export interface GoogleTagManagerPagePayload extends GoogleTagManagerBasePayload {
  event: 'virtualPageView';
  [customDimension: string]: string;
}
