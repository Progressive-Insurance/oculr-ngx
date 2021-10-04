import { StandardAction } from './standard-action.interface';
import { AnalyticsAction } from './analytics-action.enum';
import { ApiStartedPayload } from './api-started-payload.interface';

export interface ApiStartedAction extends StandardAction {
  type: AnalyticsAction.API_STARTED;
  payload: ApiStartedPayload;
}
