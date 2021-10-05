import { Directive, HostListener, Input } from '@angular/core';

import { EventExtras } from '../models/event-extras.interface';
import { AnalyticsService } from '../services/analytics.service';
import { RouterDispatchService } from '../services/router-dispatch.service';

/**
 * Directive to trigger virtual page view events for Modal dialogs opening / closing
 *
 * @example
 * ```html
 * <pui-modal #faxModal virtualPageName='Fax Modal'>
 * </pui-modal>
 * ```
 */
@Directive({
  selector: `pui-modal[virtualPageName]`,
})
export class ModalPageViewDirective {
  @Input() virtualPageName: string = '';
  @Input() excludeAppScope = false;
  @Input() additionalScopes: string[] = [];
  @Input() closeEventId: string = '';
  @Input() closeEventExtras: EventExtras = {};
  @Input() psEventExtras: EventExtras = {};
  @Input('pa-modal-route') paModalRoute?: string;

  constructor(private routerDispatchService: RouterDispatchService, private analyticsService: AnalyticsService) {}

  @HostListener('onOpen')
  modalOpened() {
    if (this.isAnalytics1Route()) {
      this.routerDispatchService.virtualRoute.next({
        type: 'push',
        url: this.virtualPageName,
        additionalScopes: this.additionalScopes,
        selectedItems: this.psEventExtras.selectedItems,
        customDimensions: this.psEventExtras.customDimensions,
        shouldIncludeAppScope: !this.excludeAppScope,
      });
    }
  }

  @HostListener('onClose', ['$event'])
  modalClosed($event: any = {}) {
    if (this.isAnalytics1Route()) {
      if ($event.closeMethod !== 'confirm' && $event.closeMethod !== 'cancel') {
        this.analyticsService.trackInteraction({
          eventId: this.closeEventId,
          selectedItems: this.closeEventExtras.selectedItems,
          variableData: this.closeEventExtras.variableData,
          customDimensions: this.closeEventExtras.customDimensions,
        });
      }

      this.routerDispatchService.virtualRoute.next({
        type: 'pop',
        url: this.virtualPageName,
        additionalScopes: this.additionalScopes,
        selectedItems: this.psEventExtras.selectedItems,
        shouldIncludeAppScope: !this.excludeAppScope,
      });
    }
  }

  private isAnalytics1Route(): boolean {
    return this.paModalRoute === undefined;
  }
}
