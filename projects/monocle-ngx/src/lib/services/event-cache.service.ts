import { Injectable } from '@angular/core';

import { UpdateLocationAction } from '../models/actions/update-location-action.interface';
import { isPageViewAction } from '../models/actions/page-view-action.interface';
import { CacheEventOptions } from '../models/cache-event-options.interface';
import { EventModel } from '../models/event-model.class';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';
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

  // TODO: remove use of UpdateLocationAction with removal of Analytics 1.0
  cacheEvent(
    action: StandardAction,
    options: CacheEventOptions = { isOnModal: this.isCurrentPageModal }
  ): void {
    if (this.isTrackedUpdateLocationAction(action)) {
      this.routerPageViewEvent = undefined;
      return;
    }
    if (!options.isOnModal && isPageViewAction(action)) {
      this.routerPageViewEvent = action.payload.eventModel;
    }
  }

  // TODO: remove with removal of Analytics 1.0
  private isTrackedUpdateLocationAction(
    action: StandardAction | UpdateLocationAction
  ): action is UpdateLocationAction {
    return action.type === AnalyticsAction.UPDATE_LOCATION && (!action.meta || action.meta.track);
  }
}
