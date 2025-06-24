/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
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
