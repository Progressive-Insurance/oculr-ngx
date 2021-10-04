import { GoogleTagManagerBasePayload } from './google-tag-manager-base-payload.interface';

// This interface should not be used on its own - it should only be used as part of the GoogleTagManagerEventPayload type
export interface GoogleTagManagerEventCorePayload extends GoogleTagManagerBasePayload {
  domain: string;
  eventID: string;
  event: 'GAEvent';
  eventAction: string;
  eventCategory: string;
  eventLabel: string;
  eventValue: number;
}
