import { SplunkEventData } from './splunk-event-data.interface';

export interface SplunkEventModelData extends SplunkEventData {
  action: string;
  category: string;
  label: string;
  milestoneName: string;
  milestoneStatus: string;
  value: any;
}
