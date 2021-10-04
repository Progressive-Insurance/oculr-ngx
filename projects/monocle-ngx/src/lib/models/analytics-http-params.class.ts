import { HttpParams } from '@angular/common/http';

import { ApiAnalyticsModels } from '../models/api-analytics-models.interface';
import { AnalyticsHttpParamsOptions } from './analytics-http-params-options.interface';

export class AnalyticsHttpParams extends HttpParams {
  constructor(public apiAnalyticsModels: ApiAnalyticsModels, options?: AnalyticsHttpParamsOptions) {
    /* We are passing the options object through to the HttpParams constructor. We created a new
     * interface for this, since the HttpParamsOptions interface is not exported by @angular/common.
     * We know this is supported by up to Angular v8, but are unsure about future releases.
     */
    super(options);
  }
}
