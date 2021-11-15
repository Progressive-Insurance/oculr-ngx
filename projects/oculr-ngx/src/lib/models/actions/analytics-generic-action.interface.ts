import { StandardAction } from './standard-action.interface';
import { EventPayload } from '../event-payload.interface';

export interface AnalyticsGenericAction extends StandardAction {
  payload: EventPayload;
}
