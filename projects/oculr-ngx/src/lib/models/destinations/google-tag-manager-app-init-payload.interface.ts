import { GoogleTagManagerBasePayload } from './google-tag-manager-base-payload.interface';

export interface GoogleTagManagerAppInitPayload extends GoogleTagManagerBasePayload {
  event: 'app.init';
  [customDimension: string]: string;
}
