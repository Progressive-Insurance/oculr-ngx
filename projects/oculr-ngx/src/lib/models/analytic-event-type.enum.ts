/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/progressive-insurance/oculr-ngx/blob/main/LICENSE.md
 */

export enum AnalyticEventType {
  DISPLAY_EVENT = 'DISPLAY_EVENT',
  CHANGE_EVENT = 'CHANGE_EVENT',
  CLICK_EVENT = 'CLICK_EVENT',
  FOCUS_EVENT = 'FOCUS_EVENT',
  PAGE_VIEW_EVENT = 'PAGE_VIEW_EVENT',
  API_START_EVENT = 'API_START_EVENT',
  API_COMPLETE_EVENT = 'API_COMPLETE_EVENT',
  APP_EVENT = 'APP_EVENT',
  APP_ERROR_EVENT = 'APP_ERROR_EVENT',
  VALIDATION_ERROR_EVENT = 'VALIDATION_ERROR_EVENT',
  NONE = ''
}
