/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

export enum EVENT_TYPES {
  page = 'page',
  track = 'track',
  error = 'error',
  event = 'event',
  validationError = 'validationError',
  apiStart = 'apiStart',
  apiComplete = 'apiComplete',
  apiSuccess = 'apiSuccess',
  apiHandledError = 'apiHandledError',
  apiUnhandledError = 'apiUnhandledError',
}
