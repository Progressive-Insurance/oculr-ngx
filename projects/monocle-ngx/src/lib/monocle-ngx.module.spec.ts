import { DOCUMENT } from '@angular/common';
import { ApplicationRef, Component, NgModule } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AnalyticsLibraryModule } from './monocle-ngx.module';
import { RouterDispatchService } from './services/router-dispatch.service';

@Component({ selector: 'ps-bootstrappable-component', template: '' })
class BootstrappableComponent {}

@NgModule({
  declarations: [BootstrappableComponent],
  bootstrap: [BootstrappableComponent],
  imports: [AnalyticsLibraryModule.forRoot([], '')],
})
class InitTestModule {}

describe('the analytics library module', () => {
  beforeEach(() => {
    const routerDispatchMock = {
      initialize: jasmine.createSpy('bootstrapper'),
    };
    TestBed.configureTestingModule({
      imports: [InitTestModule, RouterTestingModule.withRoutes([])],
      providers: [
        {
          provide: RouterDispatchService,
          useValue: routerDispatchMock,
        },
      ],
    });
  });

  beforeEach(inject([DOCUMENT], function (doc: HTMLDocument) {
    const elBootComp = doc.createElement('ps-bootstrappable-component');
    doc.body.appendChild(elBootComp);
  }));

  it('should initialize the router dispatch when app bootstraps', () => {
    const appRef: ApplicationRef = TestBed.inject(ApplicationRef);
    const r: RouterDispatchService = TestBed.inject(RouterDispatchService);

    appRef.bootstrap(BootstrappableComponent);
    expect(r.initialize).toHaveBeenCalled();
  });
});
