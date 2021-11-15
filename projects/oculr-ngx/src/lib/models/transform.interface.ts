/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

/**
 * Should transform an action and the state into an event
 * that will be sent to the analytics destination.
 */
export type Transform = (action: any, state: any) => any | undefined;
