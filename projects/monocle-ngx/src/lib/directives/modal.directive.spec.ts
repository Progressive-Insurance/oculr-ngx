import { EventModel } from '../models/event-model.class';
import { ModalDirective } from './modal.directive';

describe('ModalDirective', () => {
  let mockEventDispatchService: any;
  let mockLocationTrackingService: any;
  let modalDirective: ModalDirective;

  describe(' when routerDispatchService is available', () => {
    beforeEach(() => {
      mockEventDispatchService = jasmine.createSpyObj('', ['trackAnalyticsError', 'trackInteraction']);
      mockLocationTrackingService = jasmine.createSpyObj('', ['setModalRoute', 'setAngularRoute']);
      mockLocationTrackingService.location = {};
      modalDirective = new ModalDirective(mockEventDispatchService, mockLocationTrackingService);
    });
    describe('on modalOpened', () => {
      describe('when pa-modal-route is undefined', () => {
        describe('when virtualPageName is undefined', () => {
          it('dispatches an error action', () => {
            modalDirective.modalOpened();
            expect(mockEventDispatchService.trackAnalyticsError).toHaveBeenCalledTimes(1);
            const firstArgument = mockEventDispatchService.trackAnalyticsError.calls.argsFor(0)[0];
            expect(firstArgument instanceof TypeError).toBe(true);
          });
          it('calls setModalRoute with a default value', () => {
            modalDirective.modalOpened();
            expect(mockLocationTrackingService.setModalRoute).toHaveBeenCalledTimes(1);
            expect(mockLocationTrackingService.setModalRoute.calls.argsFor(0)[0]).toBe(
              ModalDirective.defaultModalRoute
            );
          });
        });
      });
      describe('when pa-modal-route is invalid', () => {
        it('dispatches an error action', () => {
          modalDirective.paModalRoute = 'test-route';
          modalDirective.modalOpened();
          expect(mockEventDispatchService.trackAnalyticsError).toHaveBeenCalledTimes(1);
          const firstArgument = mockEventDispatchService.trackAnalyticsError.calls.argsFor(0)[0];
          expect(firstArgument instanceof TypeError).toBe(true);
        });
        it('calls setModalRoute with a default value', () => {
          modalDirective.paModalRoute = 'test-route';
          modalDirective.modalOpened();
          expect(mockLocationTrackingService.setModalRoute).toHaveBeenCalledTimes(1);
          expect(mockLocationTrackingService.setModalRoute.calls.argsFor(0)[0]).toBe(ModalDirective.defaultModalRoute);
        });
      });
      describe('when pa-modal-route is valid', () => {
        it('does not dispatch an error action', () => {
          modalDirective.paModalRoute = '/test-modal';
          modalDirective.modalOpened();
          expect(mockEventDispatchService.trackAnalyticsError).not.toHaveBeenCalled();
        });
        it('calls setModalRoute on locationTrackingService using the modal route name', () => {
          modalDirective.paModalRoute = '/test-modal';
          modalDirective.modalOpened();
          expect(mockLocationTrackingService.setModalRoute).toHaveBeenCalledTimes(1);
          expect(mockLocationTrackingService.setModalRoute).toHaveBeenCalledWith('/test-modal', undefined, undefined);
        });
      });
    });
    describe('on modalClosed', () => {
      describe('when pa-modal-close-event is undefined', () => {
        describe('when virtualPageName is undefined', () => {
          it('dispatches an error action', () => {
            modalDirective.modalClosed();
            expect(mockEventDispatchService.trackAnalyticsError).toHaveBeenCalledTimes(1);
            const firstArgument = mockEventDispatchService.trackAnalyticsError.calls.argsFor(0)[0];
            expect(firstArgument instanceof TypeError).toBe(true);
          });
          it('does not dispatch an interaction event', () => {
            const uiModalEvent = { closeMethod: '' };
            modalDirective.modalClosed(uiModalEvent);
            expect(mockEventDispatchService.trackInteraction).not.toHaveBeenCalled();
          });
          it('calls setAngularRoute with previous route name', () => {
            modalDirective['underlyingPageRoute'] = '/parent-route';
            modalDirective.modalClosed();
            expect(mockLocationTrackingService.setAngularRoute).toHaveBeenCalledTimes(1);
            expect(mockLocationTrackingService.setAngularRoute).toHaveBeenCalledWith(
              '/parent-route',
              undefined,
              undefined
            );
          });
        });
      });
      describe('when pa-modal-close-event is not an EventModel', () => {
        it('dispatches an error action', () => {
          modalDirective.paModalCloseEvent = {} as any;
          modalDirective.modalClosed();
          expect(mockEventDispatchService.trackAnalyticsError).toHaveBeenCalledTimes(1);
          const firstArgument = mockEventDispatchService.trackAnalyticsError.calls.argsFor(0)[0];
          expect(firstArgument instanceof TypeError).toBe(true);
        });
        it('does not dispatch an interaction event', () => {
          modalDirective.paModalCloseEvent = {} as any;
          const uiModalEvent = { closeMethod: '' };
          modalDirective.modalClosed(uiModalEvent);
          expect(mockEventDispatchService.trackInteraction).not.toHaveBeenCalled();
        });
        it('calls setAngularRoute with previous route name', () => {
          modalDirective.paModalCloseEvent = {} as any;
          modalDirective['underlyingPageRoute'] = '/parent-route';
          modalDirective.modalClosed();
          expect(mockLocationTrackingService.setAngularRoute).toHaveBeenCalledTimes(1);
          expect(mockLocationTrackingService.setAngularRoute).toHaveBeenCalledWith(
            '/parent-route',
            undefined,
            undefined
          );
        });
      });
      describe('when pa-modal-close-event is a valid model', () => {
        it('calls setAngularRoute using the underlying page route', () => {
          modalDirective['underlyingPageRoute'] = '/original-page';
          modalDirective.modalClosed();
          expect(mockLocationTrackingService.setAngularRoute).toHaveBeenCalledTimes(1);
          expect(mockLocationTrackingService.setAngularRoute).toHaveBeenCalledWith(
            '/original-page',
            undefined,
            undefined
          );
        });
        describe('and not closed with the "Submit" or "Cancel" buttons', () => {
          it('dispatches an interaction action using the supplied close model', () => {
            const closeModel = new EventModel('', '', '', '', '', '', '', '', {}, [], '', '', {});
            modalDirective.paModalCloseEvent = closeModel;
            const uiModalEvent = { closeMethod: '' };
            modalDirective.modalClosed(uiModalEvent);
            expect(mockEventDispatchService.trackInteraction).toHaveBeenCalledTimes(1);
            expect(mockEventDispatchService.trackInteraction).toHaveBeenCalledWith(closeModel);
          });
        });
        describe('and closed via button', () => {
          it('does not dispatch an interaction action', () => {
            const uiModalEvent = { closeMethod: 'cancel' };
            modalDirective.modalClosed(uiModalEvent);
            expect(mockEventDispatchService.trackInteraction).not.toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe(' when routerDispatchService is not available', () => {
    beforeEach(() => {
      mockEventDispatchService = jasmine.createSpyObj('', ['trackAnalyticsError', 'trackInteraction']);
      mockLocationTrackingService = jasmine.createSpyObj('', ['setModalRoute', 'setAngularRoute']);
      mockLocationTrackingService.location = {};
      modalDirective = new ModalDirective(mockEventDispatchService, mockLocationTrackingService);
    });

    describe('on modalOpened', () => {
      it('should not should not throw an error', () => {
        modalDirective.paModalRoute = '/test-modal';
        expect(modalDirective.modalOpened.bind(modalDirective)).not.toThrow();
      });
    });
    describe('on modalClosed', () => {
      it('should not should not throw an error', () => {
        modalDirective.paModalRoute = '/test-modal';
        expect(modalDirective.modalClosed.bind(modalDirective)).not.toThrow();
      });
    });
  });
});
