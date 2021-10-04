
/* We are defining and exporting an options interface for HttpParams, because angular does not export it. (originally called HttpParamsOptions)
 * We know this is compatible with up to Angular v8, but are unsure about future releases. The interface is referenced in the HttpParams doc,
 * but has no separate entry in the docs. https://v7.angular.io/api/common/http/HttpParams.
 * Issue regarding this interface: https://github.com/angular/angular/issues/20276
 */
export interface AnalyticsHttpParamsOptions {
  /* We are in-lining a type for encoder to match `HttpParameterCodec`. We know this is supported by up to
   * Angular v8, but are unsure about future releases. https://angular.io/api/common/http/HttpParameterCodec
   */
  encoder?: {
    encodeKey(key: string): string;
    encodeValue(value: string): string;
    decodeKey(key: string): string;
    decodeValue(value: string): string;
  };
  fromObject?: { [param: string]: string | string[] };
  fromString?: string;
}
