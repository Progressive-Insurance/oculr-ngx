import { AnalyticsAction } from './analytics-action.enum';
import { UpdateLocationPayload } from '../update-location-payload.interface';
import { EVENT_TYPES } from '../../event-types';
import { StandardAction } from './standard-action.interface';

export interface UpdateLocationAction extends StandardAction {
  type: AnalyticsAction.UPDATE_LOCATION;
  payload: UpdateLocationPayload;
  meta?: { track: boolean; trackAs?: EVENT_TYPES };
}
