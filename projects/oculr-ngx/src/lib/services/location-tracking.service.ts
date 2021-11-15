import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, ParamMap, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { EventLocation } from '../models/event-location.interface';
import { PageViewEvent } from '../models/page-view-event.interface';
import { RouterUtilityService } from './router-utility.service';
import { WindowService } from './window.service';

/**
 * LocationTrackingService keeps track of current location (either angular route or modal "virtual route")
 *
 * We cannot simply use window.location.href because:
 * - modals don't update the href
 * - events that cause routing update the href before the analytics event is sent for click the link/button
 *
 * Analytics actions and directives can pull location params from this service when they are initialized to get the proper location
 */
@Injectable()
export class LocationTrackingService {
  private currentLocation: EventLocation = {
    hitId: 0,
    hostName: '',
    path: '',
    url: '',
    queryString: '',
    virtualPageName: '',
  };
  private hostName: string;
  private currentParamMap: ParamMap = {} as ParamMap;
  private currentQueryParamMap: ParamMap = {} as ParamMap;
  private lastPageView: PageViewEvent = {};

  constructor(
    private locationService: Location,
    private windowService: WindowService,
    private router: Router,
    private routerUtility: RouterUtilityService
  ) {
    this.hostName = Location.stripTrailingSlash(
      this.windowService.url.substring(0, this.windowService.url.length - this.locationService.path(true).length)
    );

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => ({
          route: this.getRouterRoute(),
          queryParamMap: this.router.routerState.root.snapshot.queryParamMap,
          paramMap: this.routerUtility.getSnapshotHierarchyAsArray([this.router.routerState.root.snapshot]).reduce(
            (acc, snapshotFragment) =>
              ({
                paramMap: snapshotFragment.paramMap,
              } as ActivatedRouteSnapshot)
          ).paramMap,
        }))
      )
      .subscribe((event) => {
        const eventLocation = this.buildEventLocation(event.route, this.getFormattedQueryString(event.queryParamMap));
        this.currentLocation = { ...eventLocation };
        this.currentParamMap = event.paramMap;
        this.currentQueryParamMap = event.queryParamMap;
      });
  }

  /** location returns the current location's parameters */
  get location(): EventLocation {
    return this.currentLocation;
  }
  get paramMap(): ParamMap {
    return this.currentParamMap;
  }
  get queryParamMap(): ParamMap {
    return this.currentQueryParamMap;
  }

  get lastPageViewEvent(): PageViewEvent {
    return this.lastPageView;
  }

  cachePageView(event: PageViewEvent): void {
    this.lastPageView = event;
  }

  updateRouteConfig(config: { replaceParamTokens: string[] } = { replaceParamTokens: [] }): void {
    this.currentLocation = this.routerUtility.insertLocationParams(
      this.currentLocation,
      config.replaceParamTokens,
      this.currentParamMap
    );
  }

  private getRouterRoute(): string {
    const rootSnapshot = this.router.routerState.root.snapshot;
    return this.getRouteFromSnapshot(rootSnapshot);
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

  // TODO: double check null check here
  private getRouteFromSnapshot(snapshot: ActivatedRouteSnapshot | null): string {
    if (snapshot == null) {
      return '';
    } else {
      const route = snapshot.routeConfig && snapshot.routeConfig.path ? '/' + snapshot.routeConfig.path : '';
      return route + this.getRouteFromSnapshot(snapshot.firstChild);
    }
  }

  private buildEventLocation(route: string, queryString = ''): EventLocation {
    const virtualPageName = route.substr(0, route.indexOf('?')) || route;

    return {
      hitId: this.currentLocation.hitId + 1,
      hostName: this.hostName,
      path: route + queryString,
      url: this.hostName + route + queryString,
      queryString,
      virtualPageName,
    };
  }
}
