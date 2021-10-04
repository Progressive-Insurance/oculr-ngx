import { EventExtras } from './event-extras.interface';

export interface HttpDispatchRequestOptions {
  startId?: string;
  startEventExtras?: EventExtras;
  successId?: string;
  successEventExtras?: EventExtras;
  errorId?: string;
  errorEventExtras?: EventExtras;
  completedId?: string;
  completedEventExtras?: EventExtras;
  isErrorCodeSuccess?: {
    [statusCode: string]: boolean;
  };
  [key: string]: any; // TODO Fix HttpDispatchService to not need this and then remove it
}
