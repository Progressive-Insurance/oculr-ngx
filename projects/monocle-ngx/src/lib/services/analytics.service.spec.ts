import { fakeAsync, tick } from '@angular/core/testing';

import { AnalyticsService } from './analytics.service';
import { EVENT_TYPES } from '../event-types';

describe('the analytics service', () => {
  let service: any;
  let mockAnalyticsEventBusService: any;
  let mockAnalyticsModel: any;

  beforeEach(() => {
    mockAnalyticsEventBusService = {
      dispatch: jasmine.createSpy('dispatch')
    };

    mockAnalyticsModel = {
      getModel: (id: string) => ({ id })
    };

    service = new AnalyticsService(mockAnalyticsEventBusService, mockAnalyticsModel);
  });

  it('should be able to be instantiated', () => {
    expect(service).toBeDefined();
  });

  it('should console.warn that the ID could not be found', () => {
    mockAnalyticsModel = {
      getModel: (id: string) => { throw 'Not found'; }
    };
    spyOn(console, 'warn');

    service = new AnalyticsService(mockAnalyticsEventBusService, mockAnalyticsModel);
    service['getModel']('TEST');

    expect(console.warn).toHaveBeenCalledTimes(6);
  });

  it('should trackInteraction', () => {
    const eventId = '123ABC567';
    const INTERACTION_EVENT = '@pgr/analytics/INTERACTION_EVENT';

    const payload: any = {
      eventId: eventId,
      customDimensions: { dataValue: 'Log it' },
      selectedItems: { policyNumber: '123456789' },
      variableData: { world: 'World' }
    };
    const interactionEvent: any = {
      event: INTERACTION_EVENT,
      id: eventId,
      model: undefined,
      customDimensions: { dataValue: 'Log it' },
      selectedItems: { policyNumber: '123456789' },
      variableData: { world: 'World' }
    };

    const expectedTrackInteractionEvent: any = {
      type: '@pgr/analytics/INTERACTION_EVENT',
      payload: interactionEvent,
      meta: {
        trackAs: EVENT_TYPES.interaction
      }
    };

    service.dispatcher = jasmine.createSpyObj('dispatcher', ['next']);

    service.trackInteraction(payload);

    expect(service.dispatcher.next).toHaveBeenCalledWith(expectedTrackInteractionEvent);
  });

  it('should replace a template in the eventLabel if data is provided in variableData', fakeAsync(() => {
    const event: any = {
      payload: {
        id: '1345',
        model: {
          details: {
            eventLabel: 'Hello {{world}}',
            eventValue: 0
          }
        },
        variableData: {
          world: 'World'
        }
      }
    };
    const expectedAction: any = {
      payload: {
        id: '1345',
        model: {
          details: {
            eventLabel: 'Hello World',
            eventValue: 0
          }
        },
        variableData: {
          world: 'World'
        }
      }
    };
    service.track(event);
    tick();
    expect(mockAnalyticsEventBusService.dispatch).toHaveBeenCalled();
    expect(mockAnalyticsEventBusService.dispatch).toHaveBeenCalledWith(expectedAction);
  }));

  it('should replace a template in the eventValue if data is provided in variableData', fakeAsync(() => {
    const event: any = {
      payload: {
        id: '1345',
        model: {
          details: {
            eventLabel: 'Things',
            eventValue: '{{duration}}'
          }
        },
        variableData: {
          duration: 300
        }
      }
    };
    const expectedAction: any = {
      payload: {
        id: '1345',
        model: {
          details: {
            eventLabel: 'Things',
            eventValue: 300
          }
        },
        variableData: {
          duration: 300
        }
      }
    };
    service.track(event);
    tick();
    expect(mockAnalyticsEventBusService.dispatch).toHaveBeenCalled();
    expect(mockAnalyticsEventBusService.dispatch).toHaveBeenCalledWith(expectedAction);
  }));
});
