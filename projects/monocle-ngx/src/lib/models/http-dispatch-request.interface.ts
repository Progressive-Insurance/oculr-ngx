import { ApiCompletedAction } from './actions/api-completed-action.interface';
import { ApiErrorAction } from './actions/api-error-action.interface';
import { ApiStartedAction } from './actions/api-started-action.interface';
import { ApiSucceededAction } from './actions/api-succeeded-action.interface';

export interface HttpDispatchRequest {
  start: (requestStartTime: number, meta: any) => ApiStartedAction;
  success: (response: any, meta: any, requestStartTime: number, requestEndTime: number) => ApiSucceededAction;
  error: (response: any, meta: any, requestStartTime: number, requestEndTime: number) => ApiErrorAction;
  completed: (response: any, meta: any, requestStartTime: number, requestEndTime: number) => ApiCompletedAction;
}
