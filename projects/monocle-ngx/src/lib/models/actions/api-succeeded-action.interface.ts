import { StandardAction } from './standard-action.interface';
import { AnalyticsAction } from './analytics-action.enum';
import { ApiFinishedPayload } from './api-finished-payload.interface';

export interface ApiSucceededAction extends StandardAction {
  type: AnalyticsAction.API_SUCCEEDED;
  payload: ApiFinishedPayload;
}
