/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

export interface EventLocation {
  // hitId - page view count - EXPERIMENTAL!
  hitId: number;
  // hostname - url up to the angular route (includes, protocol, hostname, and part of path including slot)
  hostName: string;
  // path - the angular route, starting with a slash and including query string
  path: string;
  // url - the complete url
  url: string;
  // queryString - the url query string, starting with a question mark
  queryString: string;
  // virtualPageName - just the Angular route, starting with a slash but without querystring or hash
  virtualPageName: string;
}