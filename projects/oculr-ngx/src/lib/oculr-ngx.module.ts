/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ModuleWithProviders, NgModule, inject, provideAppInitializer } from '@angular/core';
import { ConsoleService } from './destinations/console/console.service';
import { HttpApiService } from './destinations/http-api/http-api.service';
import { ChangeDirective } from './directives/change.directive';
import { ClickDirective } from './directives/click.directive';
import { DisplayDirective } from './directives/display.directive';
import { FocusDirective } from './directives/focus.directive';
import { TrackValidationDirective } from './directives/track-validation.directive';
import { AnalyticsInterceptor } from './interceptors/analytics.interceptor';
import { AnalyticsEventBusService } from './services/analytics-event-bus.service';
import { ConfigurationService } from './services/configuration.service';
import { DirectiveService } from './services/directive.service';
import { DispatchService } from './services/dispatch.service';
import { EventDispatchService } from './services/event-dispatch.service';
import { InitializationService } from './services/initialization.service';
import { LocationService } from './services/location.service';
import { TimeService } from './services/time.service';

@NgModule({
  declarations: [
    DisplayDirective,
    ClickDirective,
    ChangeDirective,
    FocusDirective,
    TrackValidationDirective
  ],
  exports: [
    DisplayDirective,
    ClickDirective,
    ChangeDirective,
    FocusDirective,
    TrackValidationDirective
  ],
  imports: [CommonModule],
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class OculrAngularModule {
  static forRoot(): ModuleWithProviders<OculrAngularModule> {
    return {
      ngModule: OculrAngularModule,
      providers: [
        AnalyticsEventBusService,
        DirectiveService,
        DispatchService,
        EventDispatchService,
        LocationService,
        TimeService,
        {
          provide: Window,
          useValue: window,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AnalyticsInterceptor,
          multi: true,
        },
        ConfigurationService,
        ConsoleService,
        HttpApiService,
        InitializationService,
        provideAppInitializer(() => {
        const initializerFn = (initializeLibrary)(inject(InitializationService));
        return initializerFn();
      }),
      ],
    };
  }
}

export function initializeLibrary(initService: InitializationService): () => Promise<void> {
  return (): Promise<void> => {
    return initService.init();
  };
}
