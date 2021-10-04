import { ParamMap } from '@angular/router';
import { EventLocation } from '../models/event-location.interface';
import { replaceTokensWithValuesFromParamMap } from './replace-tokens-with-values-from-param-map';

export const insertLocationParams = (location: EventLocation, tokens: string[], paramMap: ParamMap): EventLocation => {
  return Object.keys(location).reduce((loc, key: keyof EventLocation) => {
    if (typeof location[key] !== 'string') {
      return {
        ...loc,
        [key]: location[key]
      };
    }
    return {
      ...loc,
      [key]: replaceTokensWithValuesFromParamMap((location)[key] as string, paramMap, tokens)
    };
  }, {}) as EventLocation;
};
