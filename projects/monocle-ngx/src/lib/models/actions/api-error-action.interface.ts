import { StandardAction } from './standard-action.interface';
import { AnalyticsAction } from './analytics-action.enum';
import { ApiFinishedPayload } from './api-finished-payload.interface';

// We cannot use a union of two error types actions as the output of a function because the type property is different
export interface ApiErrorAction extends StandardAction {
  type: AnalyticsAction.API_HANDLED_ERROR | AnalyticsAction.API_UNHANDLED_ERROR;
  payload: ApiFinishedPayload;
}
