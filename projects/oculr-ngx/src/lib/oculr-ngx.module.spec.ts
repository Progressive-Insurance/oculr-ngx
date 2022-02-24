/*
 * @license
 * Copyright 2021-2022 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/progressive-insurance/oculr-ngx/blob/main/LICENSE.md
 */

import { DOCUMENT } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { OculrAngularModule } from './oculr-ngx.module';

@Component({ selector: 'oculr-bootstrappable-component', template: '' })
class BootstrappableComponent {}

@NgModule({
  declarations: [BootstrappableComponent],
  bootstrap: [BootstrappableComponent],
  imports: [OculrAngularModule.forRoot()],
})
class InitTestModule {}

describe('the analytics library module', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InitTestModule, RouterTestingModule.withRoutes([])],
      providers: [],
    });
  });

  beforeEach(inject([DOCUMENT], function (doc: HTMLDocument) {
    const elBootComp = doc.createElement('oculr-bootstrappable-component');
    doc.body.appendChild(elBootComp);
  }));
});
