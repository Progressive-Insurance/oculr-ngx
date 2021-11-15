/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

/**
 * Should select an endpoint or api key for the destination.
 * Can either return a constant or select from state.
 */
export type StringSelector = (state?: any) => string;
