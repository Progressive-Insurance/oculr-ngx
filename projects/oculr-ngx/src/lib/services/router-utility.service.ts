/* 
Copyright (c) 2021 Progressive Casualty Insurance Company. All rights reserved.

Progressive-owned, no external contributions.
*/

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ParamMap } from '@angular/router';
import { EventLocation } from '../models/event-location.interface';

@Injectable({ providedIn: 'root' })
export class RouterUtilityService {
  getSnapshotHierarchyAsArray(snapshots: ActivatedRouteSnapshot[]): ActivatedRouteSnapshot[] {
    return snapshots[snapshots.length - 1].firstChild
      ? this.getSnapshotHierarchyAsArray(
          snapshots.concat(snapshots[snapshots.length - 1].firstChild as ActivatedRouteSnapshot)
        )
      : snapshots;
  }

  insertLocationParams(location: EventLocation, tokens: string[], paramMap: ParamMap): EventLocation {
    return {
      hitId: location.hitId,
      hostName: this.replaceTokensWithValuesFromParamMap(location.hostName, paramMap, tokens),
      path: this.replaceTokensWithValuesFromParamMap(location.path, paramMap, tokens),
      url: this.replaceTokensWithValuesFromParamMap(location.url, paramMap, tokens),
      queryString: this.replaceTokensWithValuesFromParamMap(location.queryString, paramMap, tokens),
      virtualPageName: this.replaceTokensWithValuesFromParamMap(location.virtualPageName, paramMap, tokens),
    } as EventLocation;
  }

  replaceTokensWithValuesFromParamMap(tokenizedUrl = '', paramMap: ParamMap, tokensToReplace: string[]): string {
    return tokensToReplace.reduce((url: string, token: string) => {
      const paramValue = paramMap.get(token);
      if (!paramValue) {
        return url;
      }
      return url.replace(new RegExp(`:(${token})(/|\\?|$)`, 'g'), `${paramValue}$2`);
    }, tokenizedUrl);
  }
}
