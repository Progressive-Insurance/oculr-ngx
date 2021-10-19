import { Injectable } from '@angular/core';

import { isPageViewAction } from '../models/actions/page-view-action.interface';
import { CacheEventOptions } from '../models/cache-event-options.interface';
import { EventModel } from '../models/event-model.class';
import { StandardAction } from '../models/actions/standard-action.interface';

@Injectable()
export class EventCacheService {
  private routerPageViewEvent: EventModel | undefined = undefined;
  private isCurrentPageModal = false;

  getLastRouterPageViewEvent(): EventModel | undefined {
    return this.routerPageViewEvent;
  }

  setIsCurrentPageModal(isModal: boolean): void {
    this.isCurrentPageModal = isModal;
  }

  cacheEvent(action: StandardAction, options: CacheEventOptions = { isOnModal: this.isCurrentPageModal }): void {
    if (!options.isOnModal && isPageViewAction(action)) {
      this.routerPageViewEvent = action.payload.eventModel;
    }
  }
}
