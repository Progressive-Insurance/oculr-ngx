import { trackInteractionEvent, trackError, analyticsError, updateLocation } from './analytics.actions';
import { EVENT_TYPES } from '../event-types';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';
import { InteractionEventPayload } from '../models/interaction-event-payload.interface';
import { AnalyticsEventModel } from '../models/analytics-event-model.interface';

describe('Analytics Actions Creators', () => {

  describe('INTERACTION_EVENT', () => {
    const expectedAction: any = {
      type: AnalyticsAction.INTERACTION_EVENT,
      payload: {
        event: 'hi',
        id: 'id',
        model: {},
        customDimensions: {}
      },
      meta: {
        trackAs: EVENT_TYPES.interaction
      }
    };
    const model: any = {

    };
    const event: InteractionEventPayload = {
      event: 'hi',
      id: 'id',
      model: model as AnalyticsEventModel,
      customDimensions: {}
    };

    it('trackInteractionEvent creates the action with the untyped payload', () => {
      expect(trackInteractionEvent(event)).toEqual(expectedAction);
    });

  });

  describe('TRACK_ERROR', () => {
    it('trackError creates the action with only the optional errorMessage, errorCode, and errorDetail', () => {
      const expectedAction: any = {
        type: AnalyticsAction.TRACK_ERROR,
        payload: { errorCode: '', errorDetail: 'It was horrible', errorMessage: 'It broke', logLevel: 'Error' },
        meta: {
          trackAs: EVENT_TYPES.error
        }
      };

      const errorReport = { errorBlame: 'Big Bird did it', errorDetail: 'It was horrible', errorMessage: 'It broke' };
      expect(trackError(errorReport)).toEqual(expectedAction);
    });

  });

  describe('ANALYTICS_ERROR', () => {
    it('analyticsError creates an action with the full error provided', () => {
      const errorReport = { errorBlame: 'Big Bird did it', errorDetail: 'It was horrible', errorMessage: 'It broke' };
      const expectedAction: any = {
        type: AnalyticsAction.ANALYTICS_ERROR,
        payload: {
          error: errorReport
        }
      };

      expect(analyticsError(errorReport)).toEqual(expectedAction);
    });

  });

  describe('UPDATE_LOCATION', () => {
    it('creates an action with the update location payload', () => {
      const updateLocationPayload = {
        angularRoute: 'FerrariWorld', routeWithQueryString: 'www.cars.com/FerrariWorld?model=GTO', hostName: 'www.cars.com', domain: '',
        fullPath: 'www.cars.com/FerrariWorld', model: { details: { scopes: ['testScope'] } }, selectedItems: { policyNumber: '12345678' }
      };
      const expectedAction: any = {
        type: AnalyticsAction.UPDATE_LOCATION,
        payload: updateLocationPayload,
        meta: { track: true }
      };
      expect(updateLocation(updateLocationPayload, true)).toEqual(expectedAction);
    });
    it('sets meta.track property based on input', () => {
      const updateLocationPayload = {
        angularRoute: 'FerrariWorld', routeWithQueryString: 'www.cars.com/FerrariWorld?model=GTO', hostName: 'www.cars.com', domain: '',
        fullPath: 'www.cars.com/FerrariWorld', model: { details: { scopes: ['testScope'] } }, selectedItems: { policyNumber: '12345678' }
      };
      const expectedAction: any = {
        type: AnalyticsAction.UPDATE_LOCATION,
        payload: updateLocationPayload,
        meta: { track: false }
      };
      expect(updateLocation(updateLocationPayload, false)).toEqual(expectedAction);
    });
  });
});
