import { ParamMap } from '@angular/router';

import { EventLocation } from '../models/event-location.interface';
import { replaceTokensWithValuesFromParamMap } from './replace-tokens-with-values-from-param-map';

export const insertLocationParams = (location: EventLocation, tokens: string[], paramMap: ParamMap): EventLocation => {
  return {
    hitId: location.hitId,
    hostName: replaceTokensWithValuesFromParamMap(location.hostName, paramMap, tokens),
    path: replaceTokensWithValuesFromParamMap(location.path, paramMap, tokens),
    url: replaceTokensWithValuesFromParamMap(location.url, paramMap, tokens),
    queryString: replaceTokensWithValuesFromParamMap(location.queryString, paramMap, tokens),
    virtualPageName: replaceTokensWithValuesFromParamMap(location.virtualPageName, paramMap, tokens),
  } as EventLocation;
};
