import { AnalyticsAction } from '../models/actions/analytics-action.enum';
import { analyticsError } from './analytics.actions';

describe('Analytics Actions Creators', () => {
  describe('ANALYTICS_ERROR', () => {
    it('analyticsError creates an action with the full error provided', () => {
      const errorReport = { errorBlame: 'Big Bird did it', errorDetail: 'It was horrible', errorMessage: 'It broke' };
      const expectedAction: any = {
        type: AnalyticsAction.ANALYTICS_ERROR,
        payload: {
          error: errorReport,
        },
      };

      expect(analyticsError(errorReport)).toEqual(expectedAction);
    });
  });
});
