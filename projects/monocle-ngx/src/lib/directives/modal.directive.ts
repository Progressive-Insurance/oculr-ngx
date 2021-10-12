import { Directive, HostListener, Input, Optional } from '@angular/core';

import { EventModel } from '../models/event-model.class';
import { EventDispatchService } from '../services/event-dispatch.service';
import { LocationTrackingService } from '../services/location-tracking.service';
import { RouterDispatchService } from '../services/router-dispatch.service';

/**
 * Convenient directive to keep track of analytics route and trigger non-button close events.
 * This directive DOES NOT dispatch page view events.
 *
 * @example
 * ```html
 * <pui-modal #faxModal pa-modal-route='/fax-modal' pa-modal-close-event='closeModel'>
 * </pui-modal>
 * ```
 */
@Directive({
  selector: `pui-modal[pa-modal-route][pa-modal-close-event]`,
})
export class ModalDirective {
  static defaultModalRoute = 'unknown modal';

  @Input('pa-modal-route') paModalRoute = '';
  @Input('pa-modal-close-event') paModalCloseEvent?: EventModel;
  @Input() virtualPageName?: string;

  private underlyingPageRoute = '';

  constructor(
    private eventDispatchService: EventDispatchService,
    private locationTrackingService: LocationTrackingService,
    @Optional() private routerDispatchService: RouterDispatchService
  ) {}

  @HostListener('onOpen')
  modalOpened() {
    if (this.isAnalytics2Route()) {
      this.underlyingPageRoute = this.locationTrackingService.location.path;

      const isValidModalRoute = typeof this.paModalRoute === 'string' && this.paModalRoute.charAt(0) === '/';
      if (!isValidModalRoute) {
        const error = new TypeError(
          `pa-modal-route must start with a '/' character, but "${this.paModalRoute}" was sent.`
        );
        this.eventDispatchService.trackAnalyticsError(error);
      }
      const route = isValidModalRoute ? this.paModalRoute : ModalDirective.defaultModalRoute;
      this.locationTrackingService.setModalRoute(route, undefined, undefined, true);

      // TODO: remove this with the removal of 1.0 code
      if (this.routerDispatchService) {
        this.routerDispatchService.virtualRoute.next({
          type: 'push',
          url: this.paModalRoute,
          shouldTrack: false,
        });
      }
    }
  }

  @HostListener('onClose', ['$event'])
  modalClosed($event: any = {}) {
    if (this.isAnalytics2Route()) {
      const isValidCloseModel = this.paModalCloseEvent instanceof EventModel;
      if (!isValidCloseModel) {
        const error = new TypeError(
          `pa-modal-close-event must be a valid instance of EventModel, but ${typeof EventModel} was sent.`
        );
        this.eventDispatchService.trackAnalyticsError(error);
      }
      if (
        $event.closeMethod !== 'confirm' &&
        $event.closeMethod !== 'cancel' &&
        isValidCloseModel &&
        this.paModalCloseEvent
      ) {
        this.eventDispatchService.trackInteraction(this.paModalCloseEvent);
      }
      this.locationTrackingService.setAngularRoute(this.underlyingPageRoute, undefined, undefined, true);

      // TODO: remove this with the removal of 1.0 code
      if (this.routerDispatchService) {
        this.routerDispatchService.virtualRoute.next({
          type: 'pop',
          url: this.underlyingPageRoute,
        });
      }
    }
  }

  // TODO: remove this with the removal of 1.0 code
  private isAnalytics2Route(): boolean {
    return !!this.paModalRoute || !this.virtualPageName;
  }
}
