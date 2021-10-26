import { EventCacheService } from './event-cache.service';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';
import { AnalyticEventType } from '../models/analytic-event-type.enum';

describe('EventCacheService', () => {
  let eventCacheService: EventCacheService;

  beforeEach(() => {
    eventCacheService = new EventCacheService();
  });

  describe('Integration', () => {
    describe('when a 2.0 page is opened', () => {
      it('getLastRouterPageViewEvent gives the 2.0 page view event', () => {
        const pageViewEvent: any = {
          id: 'MOCK',
          eventType: AnalyticEventType.PAGE_VIEW_EVENT,
        };
        eventCacheService.cacheEvent(pageViewEvent);

        const routerPageViewEvent = eventCacheService.getLastRouterPageViewEvent();
        expect(routerPageViewEvent?.id).toEqual('MOCK');
      });
    });
    describe('when a 2.0 page calls 2.0 modal', () => {
      it('gives the 2.0 parent page view event', () => {
        const pageViewEvent: any = {
          id: 'MOCK',
          eventType: AnalyticEventType.PAGE_VIEW_EVENT,
        };
        const modalPageViewEvent: any = {
          id: 'MOCK-MODAL',
          eventType: AnalyticEventType.PAGE_VIEW_EVENT,
        };
        eventCacheService.cacheEvent(pageViewEvent);
        eventCacheService.cacheEvent(modalPageViewEvent, { isOnModal: true });

        const routerPageViewEvent = eventCacheService.getLastRouterPageViewEvent();
        expect(routerPageViewEvent?.id).toEqual('MOCK');
      });
    });
  });
});
