import { GoogleTagManagerEventCorePayload } from './google-tag-manager-event-core-payload.interface';

export type GoogleTagManagerEventPayload = GoogleTagManagerEventCorePayload & { [customDimension: string]: string; };
