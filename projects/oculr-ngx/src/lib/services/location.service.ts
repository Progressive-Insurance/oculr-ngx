/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, ParamMap, Router } from '@angular/router';
import { EventLocation } from '../models/event-location.interface';
import { ParameterizedRoute } from '../models/parameterized-route.interface';

@Injectable()
export class LocationService {
  private hostName: string;

  constructor(private routerLocation: Location, private window: Window, private router: Router) {
    // Strip any hash fragment before deriving the host name so a URL such as
    // "https://example.org/home#tab" does not corrupt the base. The previous
    // length-subtraction assumed the angular route was an exact suffix of the
    // full href, which is not the case once a fragment is present.
    const hrefWithoutHash = this.window.location.href.split('#')[0];
    const angularRoute = this.routerLocation.path(true);
    this.hostName = Location.stripTrailingSlash(
      hrefWithoutHash.substring(0, hrefWithoutHash.length - angularRoute.length)
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

  private getRouteFromSnapshot(snapshot: ActivatedRouteSnapshot | null): string {
    if (snapshot == null) {
      return '';
    } else {
      const rawPath = snapshot.routeConfig && snapshot.routeConfig.path ? snapshot.routeConfig.path : '';
      const route = rawPath ? '/' + this.substituteParams(rawPath, snapshot) : '';
      return route + this.getRouteFromSnapshot(snapshot.firstChild);
    }
  }

  // Replace each ":param" segment in a route path with its actual value from the
  // snapshot's paramMap, so a parameterized route like "/user/:id" is reported as
  // "/user/123" instead of the raw template. Segments with no matching param value
  // (wildcards, missing values) are left unchanged.
  private substituteParams(path: string, snapshot: ActivatedRouteSnapshot): string {
    return path.split('/').map((segment) => {
      if (segment.startsWith(':')) {
        const paramName = segment.slice(1);
        return snapshot.paramMap?.has(paramName) ? snapshot.paramMap.get(paramName) || segment : segment;
      }
      return segment;
    }).join('/');
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
