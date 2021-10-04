import { AnalyticsEventDetailsModel } from './analytics-event-details-model.interface';

export interface AnalyticsEventModel {
  trackOn: string;
  details: AnalyticsEventDetailsModel;
}
