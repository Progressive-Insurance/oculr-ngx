/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

export interface EventLocation {
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
