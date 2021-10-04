import { EventCacheService } from './event-cache.service';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';

describe('EventCacheService', () => {
  let eventCacheService: EventCacheService;

  beforeEach(() => {
    eventCacheService = new EventCacheService();
  });

  describe('Integration', () => {
    describe('when a 2.0 page is opened', () => {
      it('getLastRouterPageViewEvent gives the 2.0 page view event', () => {
        const pageViewAction: any = {
          type: AnalyticsAction.PAGE_VIEW_EVENT,
          payload: { eventModel: 'Page View Event Model' }
        };
        const updateLocationAction: any = {
          type: AnalyticsAction.UPDATE_LOCATION,
          meta: { track: false }
        };
        eventCacheService.cacheEvent(pageViewAction);
        eventCacheService.cacheEvent(updateLocationAction);

        const pageViewEvent = eventCacheService.getLastRouterPageViewEvent();
        expect(pageViewEvent).toEqual('Page View Event Model' as any);
      });
    });
    describe('when a 2.0 page calls 2.0 modal', () => {
      it('gives the 2.0 parent page view event', () => {
        const pageViewAction: any = {
          type: AnalyticsAction.PAGE_VIEW_EVENT,
          payload: { eventModel: 'Page View Event Model' }
        };
        const updateLocationAction: any = {
          type: AnalyticsAction.UPDATE_LOCATION,
          meta: { track: false }
        };
        const modalPageViewAction: any = {
          type: AnalyticsAction.PAGE_VIEW_EVENT,
          payload: { eventModel: 'Modal Page View Event Model' }
        };
        eventCacheService.cacheEvent(pageViewAction);
        eventCacheService.cacheEvent(updateLocationAction);
        eventCacheService.cacheEvent(modalPageViewAction, { isOnModal: true });

        const pageViewEvent = eventCacheService.getLastRouterPageViewEvent();
        expect(pageViewEvent).toEqual('Page View Event Model' as any);
      });
    });

    describe('when a 1.0 page logged by RouterDispatchService calls a 2.0 modal', () => {
      it('gives undefined', () => {
        const parentUpdateLocationAction: any = {
          type: AnalyticsAction.UPDATE_LOCATION,
          meta: { track: true }
        };
        const modalPageViewAction: any = {
          type: AnalyticsAction.PAGE_VIEW_EVENT,
          payload: { eventModel: 'Modal Page View Event Model' }
        };
        const modalUpdateLocationAction: any = {
          type: AnalyticsAction.UPDATE_LOCATION,
          meta: { track: false }
        };
        eventCacheService.cacheEvent(parentUpdateLocationAction);
        eventCacheService.cacheEvent(modalUpdateLocationAction);
        eventCacheService.cacheEvent(modalPageViewAction, { isOnModal: true });

        const pageViewEvent = eventCacheService.getLastRouterPageViewEvent();
        expect(pageViewEvent).toBeUndefined();
      });
    });

    describe('when a 1.0 page logged by RouterDispatchService called a 2.0 modal', () => {
      it('does not cache interaction event', () => {
        const updateLocationAction: any = {
          type: AnalyticsAction.UPDATE_LOCATION,
          meta: { track: true }
        };
        const modalPageViewAction: any = {
          type: AnalyticsAction.PAGE_VIEW_EVENT,
          payload: { eventModel: 'Modal Page View Event Model' }
        };
        const modalInteractionEventAction: any = {
          type: AnalyticsAction.INTERACTION_EVENT,
          payload: { eventModel: 'Interaction Event Model' }
        };
        eventCacheService.cacheEvent(updateLocationAction);
        eventCacheService.cacheEvent(modalPageViewAction, { isOnModal: true });
        eventCacheService.cacheEvent(modalInteractionEventAction);

        const pageViewEvent = eventCacheService.getLastRouterPageViewEvent();
        expect(pageViewEvent).toBeUndefined();
      });
    });
  });
});
