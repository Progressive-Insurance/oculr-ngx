import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { trackInteractionEvent } from '../actions/analytics.actions';
import { EVENT_IGNORE } from '../event-constants';
import { AnalyticsEventModelMap } from '../models/analytics-event-model-map.interface';
import { AnalyticsEventModel } from '../models/analytics-event-model.interface';
import { AnalyticsEventBusService } from './analytics-event-bus.service';
import { ANALYTICS_ERROR_MODEL_ID, ANALYTICS_EVENT_MODEL_MAPS, AnalyticsEventModelsService } from './analytics-event-models.service';
import { EventDispatchService } from './event-dispatch.service';

const MOCK_MODELS: AnalyticsEventModelMap = {
  '00000001': { trackOn: 'click', details: { eventAction: 'LinkClick' } } as AnalyticsEventModel,
  '00000002': { trackOn: 'focus', details: { eventAction: 'TextBoxFocus' } } as AnalyticsEventModel,
  '00000003': { trackOn: 'custom', details: { eventAction: 'SysEvent' } } as AnalyticsEventModel,
};

const MOCK_MODEL_A: AnalyticsEventModelMap = {
  '00000001': { trackOn: 'click', details: { eventAction: 'LinkClick' } } as AnalyticsEventModel,
};

const MOCK_MODEL_B: AnalyticsEventModelMap = {
  '00000002': { trackOn: 'focus', details: { eventAction: 'TextBoxFocus' } } as AnalyticsEventModel,
  '00000003': { trackOn: 'custom', details: { eventAction: 'SysEvent' } } as AnalyticsEventModel,
};

const MOCK_COMBINED_MODELS: AnalyticsEventModelMap = {
  ...MOCK_MODEL_A,
  ...MOCK_MODEL_B,
};

describe('AnalyticsEventModelsService', () => {
  let analyticsEventModelsService: AnalyticsEventModelsService;
  let mockAnalyticsEventBusService: any;
  let mockEventDispatchService: any;

  beforeEach(() => {
    mockAnalyticsEventBusService = {
      dispatch: jasmine.createSpy('dispatch'),
    };
    mockEventDispatchService = {
      trackAnalyticsError: jasmine.createSpy('trackAnalyticsError'),
    };
  });

  describe('get() works with single provided Models', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [RouterTestingModule.withRoutes([])],
        providers: [
          { provide: ANALYTICS_EVENT_MODEL_MAPS, useValue: [MOCK_MODELS], multi: true },
          { provide: ANALYTICS_ERROR_MODEL_ID, useValue: '00000003', multi: false },
          { provide: AnalyticsEventBusService, useValue: mockAnalyticsEventBusService },
          { provide: EventDispatchService, useValue: mockEventDispatchService },
          AnalyticsEventModelsService,
        ],
      });
      analyticsEventModelsService = TestBed.inject(AnalyticsEventModelsService);
    });

    it('returns the single provided Model', () => {
      const models = analyticsEventModelsService.getModels();
      expect(models).toEqual(MOCK_MODELS);
    });

    it('dispatches a TRACK_INTERACTION action event', () => {
      const expectedArgs: any = trackInteractionEvent({
        event: undefined,
        id: '00000003',
        model: {
          trackOn: 'custom',
          details: { eventAction: 'SysEvent' },
        },
        customDimensions: { dataValue: '' },
      } as any);
      analyticsEventModelsService.getModel('');
      expect(mockAnalyticsEventBusService.dispatch).toHaveBeenCalledWith(expectedArgs);
    });
  });

  describe('get() works with multiple provided Models', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: ANALYTICS_EVENT_MODEL_MAPS, useValue: [MOCK_MODEL_A], multi: true },
          { provide: ANALYTICS_EVENT_MODEL_MAPS, useValue: [MOCK_MODEL_B], multi: true },
          { provide: ANALYTICS_ERROR_MODEL_ID, useValue: '00000003', multi: false },
          { provide: AnalyticsEventBusService, useValue: mockAnalyticsEventBusService },
          { provide: EventDispatchService, useValue: mockEventDispatchService },
          AnalyticsEventModelsService,
        ],
      });
      analyticsEventModelsService = TestBed.inject(AnalyticsEventModelsService);
    });

    it('returns the combined models', () => {
      const models = analyticsEventModelsService.getModels();
      expect(models).toEqual(MOCK_COMBINED_MODELS);
    });
  });

  describe('getModal()', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: ANALYTICS_EVENT_MODEL_MAPS, useValue: [MOCK_MODEL_A], multi: true },
          { provide: ANALYTICS_ERROR_MODEL_ID, useValue: '00000003', multi: false },
          { provide: AnalyticsEventBusService, useValue: mockAnalyticsEventBusService },
          { provide: EventDispatchService, useValue: mockEventDispatchService },
          AnalyticsEventModelsService,
        ],
      });
      analyticsEventModelsService = TestBed.inject(AnalyticsEventModelsService);
    });

    it('will dismiss the TRACK_ERROR action when the eventID is "IGNORE"', () => {
      const response = analyticsEventModelsService.getModel(EVENT_IGNORE);

      expect(mockEventDispatchService.trackAnalyticsError).not.toHaveBeenCalled();
      expect(response).toEqual(undefined);
    });
  });

  describe('getModal()', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          { provide: ANALYTICS_EVENT_MODEL_MAPS, useValue: [MOCK_MODEL_A], multi: true },
          { provide: ANALYTICS_ERROR_MODEL_ID, useValue: 'IDONTEXIST', multi: false },
          { provide: AnalyticsEventBusService, useValue: mockAnalyticsEventBusService },
          { provide: EventDispatchService, useValue: mockEventDispatchService },
          AnalyticsEventModelsService,
        ],
      });
      analyticsEventModelsService = TestBed.inject(AnalyticsEventModelsService);
    });

    it('will dismiss the TRACK_ERROR action when the eventID is "IGNORE"', () => {
      const expectedArgs = { errorMessage: 'Could not find event registered for notFound' };
      const response = analyticsEventModelsService.getModel('notFound');

      expect(mockEventDispatchService.trackAnalyticsError).toHaveBeenCalledWith(expectedArgs);
    });
  });
});
