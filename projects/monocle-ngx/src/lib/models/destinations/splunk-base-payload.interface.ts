import { PixelArea } from '../pixel-area.type';
import { HitDate } from '../hit-date.type';
import { SplunkEventData } from './splunk-event-data.interface';

export interface SplunkBasePayload {
  application: string;
  appVersion?: string;
  appEnvrnm?: string;
  browser: {
    host: string;
    referrer: string;
    URL: string;
    viewport: PixelArea;
  };
  configuration: {
    encryption?: string;
    locale: string;
    userAgent: string;
  };
  device: {
    category: string;
    resolution: PixelArea;
  };
  dvcToken?: string;
  domain: string;
  event: SplunkEventData;
  hitDtTm: HitDate;
  hitType: string;
  pageTitle: string;
  serverName?: string;
  sourceSession: string;
  slSSID?: string;
  SSID: string;
  virtualPage: string;
}
