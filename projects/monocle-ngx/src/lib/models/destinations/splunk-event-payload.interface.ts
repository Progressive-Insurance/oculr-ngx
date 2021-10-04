import { SplunkBasePayload } from './splunk-base-payload.interface';
import { SplunkEventModelData } from './splunk-event-model-data.interface';

export interface SplunkEventPayload extends SplunkBasePayload {
  event: SplunkEventModelData;
  hitType: 'event';
}
