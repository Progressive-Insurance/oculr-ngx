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
