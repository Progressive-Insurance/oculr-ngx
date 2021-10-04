import { AnalyticsGenericAction } from './analytics-generic-action.interface';
import { AnalyticsAction } from './analytics-action.enum';
import { StandardAction } from './standard-action.interface';

export interface PageViewAction extends AnalyticsGenericAction {
  type: AnalyticsAction.PAGE_VIEW_EVENT;
}

export const isPageViewAction = (action: StandardAction): action is PageViewAction => {
  return action.type === AnalyticsAction.PAGE_VIEW_EVENT;
};
