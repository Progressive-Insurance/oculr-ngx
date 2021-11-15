/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, ModuleWithProviders, NgModule } from '@angular/core';
import { ConsoleService } from './destinations/console/console.service';
import { SplunkService } from './destinations/splunk/splunk.service';
import { ClickDirective } from './directives/click.directive';
import { DisplayDirective } from './directives/display.directive';
import { AnalyticsInterceptor } from './interceptors/analytics.interceptor';
import { AnalyticsEventBusService } from './services/analytics-event-bus.service';
import { ConfigurationService } from './services/configuration.service';
import { EventDispatchService } from './services/event-dispatch.service';
import { InitializationService } from './services/initialization.service';
import { LocationTrackingService } from './services/location-tracking.service';
import { TimeService } from './services/time.service';
import { WindowService } from './services/window.service';

@NgModule({
  imports: [CommonModule],
  declarations: [DisplayDirective, ClickDirective],
  exports: [DisplayDirective, ClickDirective],
  providers: [],
})
export class OculrAngularModule {
  static forRoot(): ModuleWithProviders<OculrAngularModule> {
    return {
      ngModule: OculrAngularModule,
      providers: [
        AnalyticsEventBusService,
        EventDispatchService,
        LocationTrackingService,
        WindowService,
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
        SplunkService,
        InitializationService,
        {
          provide: APP_INITIALIZER,
          useFactory: initializeLibrary,
          deps: [InitializationService],
          multi: true,
        },
      ],
    };
  }
}

export function initializeLibrary(initService: InitializationService): () => Promise<void> {
  return (): Promise<void> => {
    return initService.init();
  };
}
