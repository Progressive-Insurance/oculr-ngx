import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { TimeoutError } from 'rxjs';

export interface ApiActionMeta {
  response: HttpResponse<any> | HttpErrorResponse | TimeoutError;
  duration: number;
  apiEndpoint: string;
  httpStatus: string;
  httpMethod: string;
  hasEventModelTag: boolean;
}
