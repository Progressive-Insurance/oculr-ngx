import { ParamMap } from '@angular/router';

export const replaceTokensWithValuesFromParamMap = (tokenizedUrl = '', paramMap: ParamMap, tokensToReplace: string[]): string => {
  return tokensToReplace.reduce((url: string, token: string) => {
    const paramValue = paramMap.get(token);
    if (!paramValue) {
      return url;
    }
    return url.replace(new RegExp(`:(${token})(/|\\?|$)`, 'g'), `${paramValue}$2`);
  }, tokenizedUrl);
};
