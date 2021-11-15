import { GoogleTagManagerBasePayload } from './google-tag-manager-base-payload.interface';

export interface GoogleTagManagerPagePayload extends GoogleTagManagerBasePayload {
  event: 'virtualPageView';
  [customDimension: string]: string;
}
