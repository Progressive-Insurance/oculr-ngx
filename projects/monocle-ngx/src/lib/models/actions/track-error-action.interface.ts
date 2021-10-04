import { EVENT_TYPES } from '../../event-types';
import { AnalyticsAction } from './analytics-action.enum';
import { ErrorReport } from './error-report.interface';
import { StandardAction } from './standard-action.interface';

export interface TrackErrorAction extends StandardAction {
  type: AnalyticsAction.TRACK_ERROR;
  payload: ErrorReport;
  meta: {
    trackAs: EVENT_TYPES.error
  };
}
