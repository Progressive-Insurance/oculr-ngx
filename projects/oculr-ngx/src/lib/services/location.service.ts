/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ParamMap, Router } from '@angular/router';
import { EventLocation } from '../models/event-location.interface';
import { ParameterizedRoute } from '../models/parameterized-route.interface';
import { WindowService } from './window.service';

@Injectable()
export class LocationService {
  private hostName: string;

  constructor(private routerLocation: Location, private windowService: WindowService, private router: Router) {
    this.hostName = Location.stripTrailingSlash(
      this.windowService.url.substring(0, this.windowService.url.length - this.routerLocation.path(true).length)
    );
  }

  getLocation(rootSnapshot: ActivatedRouteSnapshot = this.router.routerState.root.snapshot): EventLocation {
    const currentRoute = this.getCurrentRoute(rootSnapshot);
    const queryString = this.getFormattedQueryString(currentRoute.queryParamMap);
    const virtualPageName = currentRoute.route.substring(0, currentRoute.route.indexOf('?')) || currentRoute.route;

    return {
      hostName: this.hostName,
      path: currentRoute.route + queryString,
      url: this.hostName + currentRoute.route + queryString,
      queryString,
      virtualPageName,
    };
  }

  private getCurrentRoute(rootSnapshot: ActivatedRouteSnapshot): ParameterizedRoute {
    return {
      route: this.getRouteFromSnapshot(rootSnapshot),
      queryParamMap: rootSnapshot.queryParamMap,
      paramMap: this.getSnapshotHierarchyAsArray([rootSnapshot]).reduce(
        (acc, snapshotFragment) =>
          ({
            paramMap: snapshotFragment.paramMap,
          } as ActivatedRouteSnapshot)
      ).paramMap,
    };
  }

  // TODO: double check null check here
  private getRouteFromSnapshot(snapshot: ActivatedRouteSnapshot | null): string {
    if (snapshot == null) {
      return '';
    } else {
      const route = snapshot.routeConfig && snapshot.routeConfig.path ? '/' + snapshot.routeConfig.path : '';
      return route + this.getRouteFromSnapshot(snapshot.firstChild);
    }
  }

  private getSnapshotHierarchyAsArray(snapshots: ActivatedRouteSnapshot[]): ActivatedRouteSnapshot[] {
    return snapshots[snapshots.length - 1].firstChild
      ? this.getSnapshotHierarchyAsArray(
          snapshots.concat(snapshots[snapshots.length - 1].firstChild as ActivatedRouteSnapshot)
        )
      : snapshots;
  }

  private getFormattedQueryString(queryParamMap: ParamMap): string {
    let httpParams = new HttpParams();

    if (queryParamMap == null) {
      return '';
    }
    queryParamMap.keys.forEach(function (key) {
      httpParams = httpParams.append(key, queryParamMap.get(key) || '');
    });

    return httpParams.toString() ? '?' + httpParams.toString() : '';
  }
}
