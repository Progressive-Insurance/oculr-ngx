import { StandardAction } from './standard-action.interface';
import { AnalyticsAction } from './analytics-action.enum';
import { ApiFinishedPayload } from './api-finished-payload.interface';

export interface ApiCompletedAction extends StandardAction {
  type: AnalyticsAction.API_COMPLETED;
  payload: ApiFinishedPayload;
}
