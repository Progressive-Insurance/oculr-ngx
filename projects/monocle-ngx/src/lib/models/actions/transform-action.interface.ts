import { EVENT_TYPES } from '../../event-types';
import { AnalyticsAction } from './analytics-action.enum';
import { StandardAction } from './standard-action.interface';
import { TransformActionPayload } from './transform-action-payload.interface';

export interface TransformAction extends StandardAction {
  type: AnalyticsAction;
  payload: TransformActionPayload;
  meta?: {
    trackAs?: EVENT_TYPES;    // FIXME incoming events shouldn't have trackAs
    [key: string]: any;
  };
  [key: string]: any;
}
