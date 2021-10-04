import { SplunkBasePayload } from './splunk-base-payload.interface';

export interface SplunkPagePayload extends SplunkBasePayload {
  hitType: 'page';
}
