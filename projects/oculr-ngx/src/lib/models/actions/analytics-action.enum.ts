/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

// TODO: remove all name spacing
export enum AnalyticsAction {
  /**
   * [Analytics 1.0/2.0] When the analytics module is initialized.
   * Used by some destinations to log extra data.
   */
  INIT = '@pgr/analytics/INIT',

  /**
   * [Analytics 2.0] Used to initialize the gtm dataLayer
   */
  APP_INIT = '@pgr/analytics/APP_INIT',

  /**
   * [Analytics 2.0] When the application encounters an error
   */
  APP_ERROR = '@pgr/analytics/APP_ERROR',

  /**
   * [Analytics 2.0] When tracking a system event (such as redirect from mobile)
   */
  SYSTEM_EVENT = '@pgr/analytics/SYSTEM_EVENT',

  /**
   * [Analytics 2.0] When a validation error occurs
   */
  VALIDATION_ERROR_EVENT = '@pgr/analytics/VALIDATION_ERROR_EVENT',

  /**
   * [Analytics 1.0/2.0] When there's an error in the analytics module
   */
  ANALYTICS_ERROR = '@pgr/analytics/ANALYTICS_ERROR',
}
