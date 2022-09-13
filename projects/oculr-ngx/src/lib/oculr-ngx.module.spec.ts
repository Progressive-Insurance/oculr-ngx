/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/progressive-insurance/oculr-ngx/blob/main/LICENSE.md
 */

import { TestBed } from '@angular/core/testing';

import { OculrAngularModule } from './oculr-ngx.module';

describe('OculrAngularModule', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OculrAngularModule],
    });
  });

  it('initializes', () => {
    const module = TestBed.inject(OculrAngularModule);
    expect(module).toBeTruthy();
  });
});
