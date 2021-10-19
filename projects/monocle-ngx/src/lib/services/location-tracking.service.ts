import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, convertToParamMap, NavigationEnd, ParamMap, Router } from '@angular/router';
import { merge, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { EventLocation } from '../models/event-location.interface';
import { EventCacheService } from './event-cache.service';
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
  private angularRoutes$: Subject<{ route: string; paramMap: ParamMap; queryParamMap: ParamMap }>;
  private modalRoutes$: Subject<{ route: string; paramMap: ParamMap; queryParamMap: ParamMap }>;
  private currentParamMap: ParamMap = {} as ParamMap;
  private currentQueryParamMap: ParamMap = {} as ParamMap;

  constructor(
    private locationService: Location,
    private windowService: WindowService,
    private router: Router,
    private eventCache: EventCacheService,
    private routerUtility: RouterUtilityService
  ) {
    this.hostName = Location.stripTrailingSlash(
      this.windowService.url.substring(0, this.windowService.url.length - this.locationService.path(true).length)
    );

    this.angularRoutes$ = new Subject();
    this.modalRoutes$ = new Subject();

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
        this.angularRoutes$.next(event);
      });

    merge(
      this.angularRoutes$.pipe(map((event) => ({ event, isModal: false }))),
      this.modalRoutes$.pipe(map((event) => ({ event, isModal: true })))
    ).subscribe(({ event, isModal }) => {
      const eventLocation = this.buildEventLocation(event.route, this.getFormattedQueryString(event.queryParamMap));
      this.currentLocation = { ...eventLocation };
      this.eventCache.setIsCurrentPageModal(isModal);
      this.currentParamMap = event.paramMap;
      this.currentQueryParamMap = event.queryParamMap;
    });
  }

  /** location returns the current location's parameters */
  get location() {
    return this.currentLocation;
  }
  get paramMap() {
    return this.currentParamMap;
  }
  get queryParamMap() {
    return this.currentQueryParamMap;
  }

  setAngularRoute = (
    virtualPageName: string,
    params: { [key: string]: string } = {},
    queryParams: { [key: string]: string } = {}
  ) => {
    this.angularRoutes$.next({
      route: virtualPageName,
      paramMap: convertToParamMap(params),
      queryParamMap: convertToParamMap(queryParams),
    });
  };

  setModalRoute = (
    virtualPageName: string,
    params: { [key: string]: string } = {},
    queryParams: { [key: string]: string } = {}
  ) => {
    this.modalRoutes$.next({
      route: virtualPageName,
      paramMap: convertToParamMap(params),
      queryParamMap: convertToParamMap(queryParams),
    });
  };

  updateRouteConfig = (config: { replaceParamTokens: string[] } = { replaceParamTokens: [] }) => {
    this.currentLocation = this.routerUtility.insertLocationParams(
      this.currentLocation,
      config.replaceParamTokens,
      this.currentParamMap
    );
  };

  private getRouterRoute = () => {
    const rootSnapshot = this.router.routerState.root.snapshot;
    return this.getRouteFromSnapshot(rootSnapshot);
  };

  private getFormattedQueryString = (queryParamMap: ParamMap): string => {
    let httpParams = new HttpParams();

    if (queryParamMap == null) {
      return '';
    }
    queryParamMap.keys.forEach(function (key) {
      httpParams = httpParams.append(key, queryParamMap.get(key) || '');
    });

    return httpParams.toString() ? '?' + httpParams.toString() : '';
  };

  // TODO: double check null check here
  private getRouteFromSnapshot = (snapshot: ActivatedRouteSnapshot | null): string => {
    if (snapshot == null) {
      return '';
    } else {
      const route = snapshot.routeConfig && snapshot.routeConfig.path ? '/' + snapshot.routeConfig.path : '';
      return route + this.getRouteFromSnapshot(snapshot.firstChild);
    }
  };

  private buildEventLocation = (route: string, queryString = ''): any => {
    const virtualPageName = route.substr(0, route.indexOf('?')) || route;

    return {
      hitId: this.currentLocation.hitId + 1,
      hostName: this.hostName,
      path: route + queryString,
      url: this.hostName + route + queryString,
      queryString,
      virtualPageName,
    };
  };
}
