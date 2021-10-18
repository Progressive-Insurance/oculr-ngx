import { fakeAsync, tick } from '@angular/core/testing';

import { AnalyticsService } from './analytics.service';
import { EVENT_TYPES } from '../event-types';

describe('the analytics service', () => {
  let service: any;
  let mockAnalyticsEventBusService: any;
  let mockAnalyticsModel: any;

  beforeEach(() => {
    mockAnalyticsEventBusService = {
      dispatch: jasmine.createSpy('dispatch'),
    };

    mockAnalyticsModel = {
      getModel: (id: string) => ({ id }),
    };

    service = new AnalyticsService(mockAnalyticsEventBusService, mockAnalyticsModel);
  });

  it('should be able to be instantiated', () => {
    expect(service).toBeDefined();
  });

  it('should console.warn that the ID could not be found', () => {
    mockAnalyticsModel = {
      getModel: (id: string) => {
        throw 'Not found';
      },
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
      variableData: { world: 'World' },
    };
    const interactionEvent: any = {
      event: INTERACTION_EVENT,
      id: eventId,
      model: undefined,
      customDimensions: { dataValue: 'Log it' },
      selectedItems: { policyNumber: '123456789' },
      variableData: { world: 'World' },
    };

    const expectedTrackInteractionEvent: any = {
      type: '@pgr/analytics/INTERACTION_EVENT',
      payload: interactionEvent,
      meta: {
        trackAs: EVENT_TYPES.interaction,
      },
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
            eventValue: 0,
          },
        },
        variableData: {
          world: 'World',
        },
      },
    };
    const expectedAction: any = {
      payload: {
        id: '1345',
        model: {
          details: {
            eventLabel: 'Hello World',
            eventValue: 0,
          },
        },
        variableData: {
          world: 'World',
        },
      },
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
            eventValue: '{{duration}}',
          },
        },
        variableData: {
          duration: 300,
        },
      },
    };
    const expectedAction: any = {
      payload: {
        id: '1345',
        model: {
          details: {
            eventLabel: 'Things',
            eventValue: 300,
          },
        },
        variableData: {
          duration: 300,
        },
      },
    };
    service.track(event);
    tick();
    expect(mockAnalyticsEventBusService.dispatch).toHaveBeenCalled();
    expect(mockAnalyticsEventBusService.dispatch).toHaveBeenCalledWith(expectedAction);
  }));

  describe('determineValue', () => {
    it('should return value if it is a valid number', () => {
      expect(service['determineValue'](0, 'other')).toBe(0);
    });

    it('should skip value if it is undefined', () => {
      expect(service['determineValue'](undefined, 'other')).toBe('other');
    });

    it('should skip value if it is null', () => {
      expect(service['determineValue'](null, 'other')).toBe('other');
    });

    it('should skip value if it is empty string', () => {
      expect(service['determineValue']('', 'other')).toBe('other');
    });

    it('should prefer the fallback value if it is provided', () => {
      expect(service['determineValue'](null, 'final', 'fallback')).toBe('fallback');
    });

    it('should allow for fallback to be 0', () => {
      expect(service['determineValue'](null, 'final', 0)).toBe(0);
    });
  });

  describe('indexReplacer', () => {
    it('should increment value by 1 if p1 ends in Index', () => {
      expect(service['indexReplacer']('{{ testIndex }}', 'testIndex', 0, undefined)).toBe(1);
    });

    it('should do nothing to value if Index is found in the middle of match', () => {
      expect(service['indexReplacer']('{{ testIndexs }}', 'testIndexs', 5, undefined)).toBe(5);
    });

    it('should allow for zero values', () => {
      expect(service['indexReplacer']('{{ any }}', 'any', 0, undefined)).toBe(0);
    });

    it('should do nothing to value if Index is found at the start of match', () => {
      expect(service['indexReplacer']('{{ Index }}', 'Index', 5, undefined)).toBe(5);
    });
  });

  describe('replaceVars', () => {
    it('replaces variables in double braces "{{ }}" with values from values object if found', () => {
      const template = 'I ate a {{food}}';
      const values = { food: 'hamburger' };
      expect(service['replaceVars'](template, values)).toBe('I ate a hamburger');
    });

    it('replaces multiple variables in one call', () => {
      const template = 'I ate a {{food}} and drank a {{ drink }}';
      const values = { food: 'hamburger', drink: 'pepsi' };
      expect(service['replaceVars'](template, values)).toBe('I ate a hamburger and drank a pepsi');
    });

    it('does not perform substitution if no data is found', () => {
      const template = 'I ate a {{food}}';
      const values = {};
      expect(service['replaceVars'](template, values)).toBe('I ate a {{food}}');
    });

    it('does not replace variable if it is in single braces "{}"', () => {
      const template = 'I ate a {food}';
      const values = { food: 'hamburger' };
      expect(service['replaceVars'](template, values)).toBe('I ate a {food}');
    });

    it('should use the specified fallback value if a match is not found', () => {
      const template = 'I should display the {{default}}';
      const expected = 'I should display the 0';
      const actual = service['replaceVars'](template, {}, '0');
      expect(actual).toBe(expected);
    });

    it('should use the indexReplacer to increment values with Index at the end', () => {
      const template = 'I should display the {{someIndex}}';
      const expected = 'I should display the 1';
      const actual = service['replaceVars'](template, { someIndex: '0' }, '7');
      expect(actual).toBe(expected);
    });
  });
});
