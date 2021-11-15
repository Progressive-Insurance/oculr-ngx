import { GoogleTagManagerEvent } from './google-tag-manager-event.type';

/**
 * Base type for all GoogleTagManager Payloads.
 * Do not instantiate directly, use inheritted types
 */
export interface GoogleTagManagerBasePayload {
  domain: string;
  event: GoogleTagManagerEvent;
}
