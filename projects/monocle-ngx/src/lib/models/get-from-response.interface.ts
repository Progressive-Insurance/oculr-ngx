import { HttpResponse } from '@angular/common/http';

export interface GetFromResponseInterface {
  (response: HttpResponse<any>): string | number | any[];
}
