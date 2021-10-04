export interface AnalyticsEventDetailsModel {
  eventId: string;
  event: string;
  milestoneName: string;
  milestoneStatus: string;
  eventCategory: string;
  eventAction: string;
  eventLabel: string;
  eventValue: number | string;
  scopes: Array<string>;
}
