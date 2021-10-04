import { StandardAction } from './standard-action.interface';
import { ApiActionMeta } from '../api-action-meta.interface';
import { EventPayload } from '../event-payload.interface';
import { ApiStartActionMeta } from '../api-start-action-meta.interface';

export interface AnalyticsApiAction extends StandardAction {
  payload: EventPayload;
  meta: ApiActionMeta | ApiStartActionMeta;
}
