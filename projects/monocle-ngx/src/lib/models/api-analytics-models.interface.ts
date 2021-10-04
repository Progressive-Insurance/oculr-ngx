import { EventModel } from './event-model.class';

export interface ApiAnalyticsModels {
  start?: EventModel;
  success?: EventModel;
  error?: EventModel;
  complete?: EventModel;
}
