import { Injectable } from '@angular/core';
import { AnalyticEventType } from '../models/analytic-event-type.enum';
import { AnalyticEvent } from '../models/analytic-event.interface';
import { CacheEventOptions } from '../models/cache-event-options.interface';

@Injectable()
export class EventCacheService {
  private routerPageViewEvent: AnalyticEvent | undefined = undefined;
  private isCurrentPageModal = false;

  getLastRouterPageViewEvent(): AnalyticEvent | undefined {
    return this.routerPageViewEvent;
  }

  setIsCurrentPageModal(isModal: boolean): void {
    this.isCurrentPageModal = isModal;
  }

  cacheEvent(event: AnalyticEvent, options: CacheEventOptions = { isOnModal: this.isCurrentPageModal }): void {
    if (!options.isOnModal && event.eventType === AnalyticEventType.PAGE_VIEW_EVENT) {
      this.routerPageViewEvent = event;
    }
  }
}
