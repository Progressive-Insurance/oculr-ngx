/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Injectable } from '@angular/core';

@Injectable()
export class WindowService {
  constructor(private window: Window) {}

  get url(): string {
    return this.window.location.href;
  }

  // FIXME: this is be used in google-tage-manager.service.ts incorrectly and needs to be appropriately typed as Window or removed
  get nativeWindow(): any {
    return this.window;
  }
}
