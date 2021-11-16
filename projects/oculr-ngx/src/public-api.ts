/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

export { OculrAngularModule } from './lib/oculr-ngx.module';

export { GoogleTagManagerService } from './lib/destinations/google-tag-manager/google-tag-manager.service';

export { DisplayDirective } from './lib/directives/display.directive';
export { ClickDirective } from './lib/directives/click.directive';
export { ChangeDirective } from './lib/directives/change.directive';

export { API_EVENT_CONTEXT } from './lib/interceptors/analytics.interceptor';

export { AnalyticEventType } from './lib/models/analytic-event-type.enum';
export { AnalyticEvent } from './lib/models/analytic-event.interface';
export { ApiContext } from './lib/models/api-context.interface';
export { ApiEventContext } from './lib/models/api-event-context.interface';
export { AppConfiguration } from './lib/models/app-configuration.interface';
export { DestinationConfig } from './lib/models/destination-config.interface';
export { Destinations } from './lib/models/destinations.enum';
// TODO: to review expose, lean towards interfaces
export { EventModel } from './lib/models/event-model.class';
export { EventPayload } from './lib/models/event-payload.interface';
export { AnalyticsErrorAction } from './lib/models/actions/analytics-error-action.interface';
export { AnalyticsGenericAction } from './lib/models/actions/analytics-generic-action.interface';
export { Transform } from './lib/models/transform.interface';
export { AnalyticsAction } from './lib/models/actions/analytics-action.enum';
export { StandardAction } from './lib/models/actions/standard-action.interface';

export { AnalyticsEventBusService } from './lib/services/analytics-event-bus.service';
export { ConfigurationService } from './lib/services/configuration.service';
export { EventDispatchService } from './lib/services/event-dispatch.service';
// TODO: This may or may not need to be exposed. Leaving here for now to match existing exposure.
export { FormattingService } from './lib/services/formatting.service';
