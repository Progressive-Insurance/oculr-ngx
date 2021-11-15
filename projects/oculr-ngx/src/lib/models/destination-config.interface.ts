import { HttpHeaders } from '@angular/common/http';
import { Destinations } from './destinations.enum';

export interface DestinationConfig {
  name: Destinations;
  sendCustomEvents: boolean;
  endpoint?: string;
  method?: 'POST' | 'PUT';
  headers?: HttpHeaders;
}
