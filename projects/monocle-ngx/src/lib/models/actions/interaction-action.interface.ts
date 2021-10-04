import { EVENT_TYPES } from '../../event-types';
import { AnalyticsAction } from './analytics-action.enum';
import { InteractionEventPayload } from '../interaction-event-payload.interface';
import { StandardAction } from './standard-action.interface';

export interface InteractionAction extends StandardAction {
  type: AnalyticsAction.INTERACTION_EVENT;
  payload: InteractionEventPayload;
  meta: {
    trackAs: EVENT_TYPES.interaction
    [id: string]: any;
  };
}
