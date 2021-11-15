/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Transform } from '../../models/transform.interface';
import { StateProvider } from '../../models/state-provider.type';
import { AnalyticsEventBusService } from '../../services/analytics-event-bus.service';
import { WindowService } from '../../services/window.service';

import { GoogleTagManagerService } from './google-tag-manager.service';
import { EventDispatchService } from '../../services/event-dispatch.service';

export function createGoogleTagManagerService(
  window: WindowService,
  eventBus: AnalyticsEventBusService,
  eventDispatchService: EventDispatchService,
  appStateFn$: StateProvider,
  transform: Transform
) {
  return new GoogleTagManagerService(window, eventBus, eventDispatchService, appStateFn$, transform);
}
