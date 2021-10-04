import { AnalyticsAction } from './analytics-action.enum';
import { StandardAction } from './standard-action.interface';

export interface AnalyticsErrorAction extends StandardAction {
  type: AnalyticsAction.ANALYTICS_ERROR;
  payload: any;
}
