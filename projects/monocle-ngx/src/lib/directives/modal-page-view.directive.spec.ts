import { Subject } from 'rxjs';

import { VirtualPageStackAction } from '../models/router-dispatch.interface';
import { EventExtras } from '../models/event-extras.interface';
import { TrackInteractionPayload } from '../models/track-interaction-payload.interface';
import { ModalPageViewDirective } from './modal-page-view.directive';

describe('The Modal Page View directive', () => {
  let mockAnalyticsService: any;
  let mockRouterDispatchService: any;
  let modalPageViewDirective: ModalPageViewDirective;
  const psEventExtras: EventExtras = {
    selectedItems: { policy: '123456789' },
    customDimensions: { dataValue: 'apple' }
  };
  const closeEventExtrasData: EventExtras = {
    selectedItems: { policy: '987654321' },
    customDimensions: { c: 'cx' },
    variableData: { v: 'vx' }
  };

  beforeEach(() => {
    mockAnalyticsService = jasmine.createSpyObj('analyticsService', ['trackInteraction']);
    mockRouterDispatchService = { virtualRoute: new Subject<VirtualPageStackAction>() };

    spyOn(mockRouterDispatchService.virtualRoute, 'next');

    modalPageViewDirective = new ModalPageViewDirective(mockRouterDispatchService, mockAnalyticsService);

    modalPageViewDirective.virtualPageName = 'my virtual page';
    modalPageViewDirective.paModalRoute = undefined;
    modalPageViewDirective.closeEventId = '125EAT456';
    modalPageViewDirective.additionalScopes = ['PolicyScope'];
    modalPageViewDirective.psEventExtras = psEventExtras;
    modalPageViewDirective.closeEventExtras = closeEventExtrasData;
  });

  describe('Modal onOpen Events', () => {
    describe('when pa-modal-route is undefined', () => {
      it('should emit a new virtual route event', () => {
        modalPageViewDirective.paModalRoute = undefined;
        modalPageViewDirective.modalOpened();
        expect(mockRouterDispatchService.virtualRoute.next).toHaveBeenCalledWith({
          type: 'push',
          url: 'my virtual page',
          additionalScopes: ['PolicyScope'],
          selectedItems: { policy: '123456789' },
          customDimensions: { dataValue: 'apple' },
          shouldIncludeAppScope: true
        });
      });
    });
    describe('when pa-modal-route is defined', () => {
      it('should not emit a new virtual route event', () => {
        modalPageViewDirective.paModalRoute = '/some-modal-route';
        modalPageViewDirective.modalOpened();
        expect(mockRouterDispatchService.virtualRoute.next).not.toHaveBeenCalled();
      });
    });
  });

  describe('Modal onClose Events', () => {
    let trackInteractionPayload: TrackInteractionPayload;

    beforeEach(() => {
      trackInteractionPayload = {
        eventId: '125EAT456',
        ...closeEventExtrasData
      };
    });

    describe('when pa-modal-route is undefined', () => {
      it('should emit a new virtual route', () => {
        modalPageViewDirective.modalClosed({
          isConfirmed: false,
          closeMethod: 'confirm'
        });
        expect(mockRouterDispatchService.virtualRoute.next).toHaveBeenCalledWith({
          type: 'pop',
          url: 'my virtual page',
          additionalScopes: ['PolicyScope'],
          selectedItems: { policy: '123456789' },
          shouldIncludeAppScope: true
        });
      });

      it('should emit an analyticsService track event when closeMethod is "icon"', () => {
        modalPageViewDirective.modalClosed({
          isConfirmed: false,
          closeMethod: 'icon'
        });

        expect(mockAnalyticsService.trackInteraction).toHaveBeenCalledWith(trackInteractionPayload);
      });

      it('should not emit an analyticsService track event when closeMethod = "cancel"', () => {
        modalPageViewDirective.modalClosed({
          isConfirmed: false,
          closeMethod: 'cancel'
        });
        expect(mockAnalyticsService.trackInteraction).not.toHaveBeenCalled();
      });

      it('should not emit an analyticsService track event when closeMethod = "confirm"', () => {
        modalPageViewDirective.modalClosed({
          isConfirmed: false,
          closeMethod: 'confirm'
        });
        expect(mockAnalyticsService.trackInteraction).not.toHaveBeenCalled();
      });
    });

    describe('when pa-modal-route is defined', () => {
      it('should not emit a new virtual route', () => {
        modalPageViewDirective.paModalRoute = '/some-modal-route';
        modalPageViewDirective.modalClosed({
          isConfirmed: false,
          closeMethod: 'confirm'
        });
        expect(mockRouterDispatchService.virtualRoute.next).not.toHaveBeenCalled();
      });
    });
  });
});
