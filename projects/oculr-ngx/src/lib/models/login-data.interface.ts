/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { LoginStatus } from '../models/login-status';
import { LoginIndicator } from '../models/login-indicator.type';

export interface LoginData {
  customerId: string;
  entityId: string;
  entityType: string;
  hasDecodedAccessToken: boolean;
  isLoggedIn: boolean;
  loginIndicator: LoginIndicator;
  loginStatus: LoginStatus;
  loginMethod: string;
  policyNumber: string;
  policyNumberArray: string;
  trackingId: string;
}
