import { ApiContext } from './api-context.interface';

export interface ApiEventContext {
  start: ApiContext;
  success: ApiContext;
  failure: ApiContext;
}
