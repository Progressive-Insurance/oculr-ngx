import { EVENT_TYPES } from '../event-types';
import { EventIdErrorDirective } from './event-id-error.directive';

const MODELS: any = {
  '000000A1': {
    trackOn: 'click',
    details: {
      eventAction: 'LinkClick',
      eventCategory: 'Servicing',
      eventLabel: 'Doing Things',
      eventValue: 0,
      scopes: ['AppScope']
    }
  }
};

describe('Event Id Error Directive', () => {
  let eventIdErrorDirective: EventIdErrorDirective;
  let mockAnalyticsService: any;
  let mockAnalyticsEventModelsService: any;

  beforeEach(() => {
    mockAnalyticsService = jasmine.createSpyObj('mockAnalyticsService', ['track']);
    mockAnalyticsEventModelsService = jasmine.createSpyObj('mockAnalyticsEventModelsService', ['getModel']);

    eventIdErrorDirective = new EventIdErrorDirective(mockAnalyticsService, mockAnalyticsEventModelsService);
  });

  describe('psEventExtras', () => {
    it('should have an empty object as a default value', () => {
      const expectedValue: any = {};
      expect(eventIdErrorDirective.psEventExtras).toEqual(expectedValue);
    });
  });

  describe('errorStateChanged', () => {
    beforeEach(() => {
      spyOn(eventIdErrorDirective, 'handleEvent');
    });

    it('should not call handleEvent when event is falsey', () => {
      const errorStateChangedEvent: any = undefined;

      eventIdErrorDirective.errorStateChanged(errorStateChangedEvent);

      expect(eventIdErrorDirective.handleEvent).not.toHaveBeenCalledWith(errorStateChangedEvent);
    });

    it('should call handleEvent when event is true and event is visible', () => {
      const errorStateChangedEvent = {
        visible: true
      };

      eventIdErrorDirective.errorStateChanged(errorStateChangedEvent);

      expect(eventIdErrorDirective.handleEvent).toHaveBeenCalledWith(errorStateChangedEvent);
    });

    it('should not call handleEvent when event is true and event is not visible', () => {
      const errorStateChangedEvent = {
        visible: false
      };

      eventIdErrorDirective.errorStateChanged(errorStateChangedEvent);

      expect(eventIdErrorDirective.handleEvent).not.toHaveBeenCalledWith(errorStateChangedEvent);
    });
  });

  describe('Call function ngOnInit', () => {
    it('should call analyticsEventModel.getModel with the event id', () => {
      eventIdErrorDirective.psEventId = '000000A1';

      eventIdErrorDirective.ngOnInit();

      expect(mockAnalyticsEventModelsService.getModel).toHaveBeenCalledWith('000000A1');
    });

    it('should call analyticsEventModel.getModel with the event id and return the event model', () => {
      eventIdErrorDirective.psEventId = '000000A1';

      mockAnalyticsEventModelsService.getModel.and.returnValue(MODELS['000000A1']);

      eventIdErrorDirective.ngOnInit();

      expect(eventIdErrorDirective.eventModel).toEqual(MODELS['000000A1']);
    });
  });

  describe('Call function handleEvent', () => {
    it('should call track interaction event with payload', () => {
      eventIdErrorDirective.psEventId = '000000A1';
      eventIdErrorDirective.psEventExtras = {
        customDimensions: undefined,
        variableData: undefined,
        selectedItems: { agentCode: 'ABC123' }
      };
      eventIdErrorDirective.eventModel = MODELS['000000A1'];

      const clickEvent: Event = new Event('click');
      eventIdErrorDirective.handleEvent(clickEvent);

      expect(mockAnalyticsService.track).toHaveBeenCalledWith({
        type: '@pgr/analytics/INTERACTION_EVENT',
        payload: {
          event: clickEvent,
          id: '000000A1',
          model: MODELS['000000A1'],
          customDimensions: undefined,
          variableData: undefined,
          selectedItems: { agentCode: 'ABC123' }
        },
        meta: {
          trackAs: EVENT_TYPES.interaction
        }
      });
    });

    describe('when psEventExtras input property has a value of undefined', () => {
      it('should default customDimensions, variableData and selectedItems to undefined', () => {
        eventIdErrorDirective.psEventId = '000000A1';
        eventIdErrorDirective.psEventExtras = undefined;
        eventIdErrorDirective.eventModel = MODELS['000000A1'];

        const clickEvent: Event = new Event('click');
        eventIdErrorDirective.handleEvent(clickEvent);

        expect(mockAnalyticsService.track).toHaveBeenCalledWith({
          type: '@pgr/analytics/INTERACTION_EVENT',
          payload: {
            event: clickEvent,
            id: '000000A1',
            model: MODELS['000000A1'],
            customDimensions: undefined,
            variableData: undefined,
            selectedItems: undefined
          },
          meta: {
            trackAs: EVENT_TYPES.interaction
          }
        });
      });
    });
  });
});
