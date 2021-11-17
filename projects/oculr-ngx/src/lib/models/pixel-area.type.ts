/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

/**
 * PixelArea is a string formatted as <width in pixels>x<height in pixels>
 * For example: '320x480'
 * It would satisfy this regex /^\d+x\d+$/
 */
export type PixelArea = string;