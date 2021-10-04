import { SelectedItems } from './selected-items.interface';
import { VariableData } from './variable-data.interface';

export interface UpdateLocationPayload {
  // angularRoute - just the Angular route, starting with a slash but without querystring or hash
  angularRoute: string;
  // routeWithQueryString - the angular route, starting with a slash and including query string and hash
  routeWithQueryString: string;
  // hostname - url up to the angular route (includes, protocol, hostname, and part of path including slot)
  hostName: string;
  // domain - Unused.  DEPRECATED
  domain: string;
  // fullPath - the complete url
  fullPath: string;
  model: {
    details: {
      scopes: string[]
    }
  };
  selectedItems?: SelectedItems;
  customDimensions?: VariableData;
}
