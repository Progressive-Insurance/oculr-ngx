import { AnalyticsEventModel } from './analytics-event-model.interface';

export interface ApiEventPayload {
  response: any;
  id: string;
  model: AnalyticsEventModel;
  customDimensions: any;
}
