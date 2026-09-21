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
    this.hostName = this.getHostName();
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

  /**
   * Derives the prefix of the external URL up to the Angular route (protocol, hostname, and the
   * deployment slot) by resolving the location strategy's external root against the browser URL.
   * The normalized route text is not a literal suffix of the raw href (Angular strips the base
   * path and terminal index document, and hash routes live after a delimiter), so the prefix is
   * computed through the strategy's URL preparation instead; only the root's own trailing route
   * boundary is removed, keeping any slash that belongs to the document path.
   */
  private getHostName(): string {
    const externalRoot = this.routerLocation.prepareExternalUrl('/');
    const resolved = new URL(externalRoot, this.window.location.href).href;
    return resolved.endsWith('/') ? resolved.slice(0, -1) : resolved;
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
      (queryParamMap.getAll(key) || []).forEach(function (value) {
        httpParams = httpParams.append(key, value);
      });
    });

    return httpParams.toString() ? '?' + httpParams.toString() : '';
  }
}
