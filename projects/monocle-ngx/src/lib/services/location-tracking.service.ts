import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router, NavigationEnd, ParamMap, convertToParamMap } from '@angular/router';
import { Subject, merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { UpdateLocationPayload } from '../models/update-location-payload.interface';
import { updateLocation } from '../actions/analytics.actions';
import { SelectedItems } from '../models/selected-items.interface';
import { WindowService } from '../utils/window.service';
import { VariableData } from '../models/variable-data.interface';
import { EventLocation } from '../models/event-location.interface';
import { getSnapshotHierarchyAsArray } from '../utils/get-snapshot-hierarchy-as-array';
import { insertLocationParams } from '../utils/insert-location-params';
import { AnalyticsEventBusService } from './analytics-event-bus.service';
import { EventCacheService } from './event-cache.service';

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
    virtualPageName: ''
  };
  private hostName: string;
  private angularRoutes$: Subject<{ route: string; paramMap: ParamMap; queryParamMap: ParamMap }>;
  private modalRoutes$: Subject<{ route: string; paramMap: ParamMap; queryParamMap: ParamMap }>;
  private currentParamMap: ParamMap;
  private currentQueryParamMap: ParamMap;

  constructor(
    private locationService: Location,
    private windowService: WindowService,
    private router: Router,
    private eventBus: AnalyticsEventBusService,
    private eventCache: EventCacheService
  ) {
    this.hostName = Location.stripTrailingSlash(
      this.windowService.url.substring(0, this.windowService.url.length - this.locationService.path(true).length)
    );

    this.angularRoutes$ = new Subject();
    this.modalRoutes$ = new Subject();

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => ({
          route: this.getRouterRoute(),
          queryParamMap: this.router.routerState.root.snapshot.queryParamMap,
          paramMap: getSnapshotHierarchyAsArray([this.router.routerState.root.snapshot]).reduce(
            (acc, snapshotFragment) =>
              ({
                paramMap: snapshotFragment.paramMap
              } as ActivatedRouteSnapshot)
          ).paramMap
        }))
      )
      .subscribe(event => {
        this.angularRoutes$.next(event);
      });

    merge(
      this.angularRoutes$.pipe(map(event => ({event, isModal: false}))),
      this.modalRoutes$.pipe(map(event => ({event, isModal: true })))
    ).subscribe(({event, isModal}) => {
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
    queryParams: { [key: string]: string } = {},
    disableUpdateLocation: boolean = false) => {
    this.angularRoutes$.next({ route: virtualPageName, paramMap: convertToParamMap(params), queryParamMap: convertToParamMap(queryParams) });
    if (!disableUpdateLocation) {
      this.dispatchUpdateLocation(virtualPageName);
    }
  }

  setModalRoute = (
    virtualPageName: string,
    params: { [key: string]: string } = {},
    queryParams: { [key: string]: string } = {},
    disableUpdateLocation: boolean = false) => {
    this.modalRoutes$.next({ route: virtualPageName, paramMap: convertToParamMap(params), queryParamMap: convertToParamMap(queryParams) });
    if (!disableUpdateLocation) {
      this.dispatchUpdateLocation(virtualPageName);
    }
  }

  updateRouteConfig = (config: { replaceParamTokens: string[] } = { replaceParamTokens: [] }) => {
    this.currentLocation = insertLocationParams(this.currentLocation, config.replaceParamTokens, this.currentParamMap);
  }

  // DEPRECATED: dispatch old UPDATE_LOCATION event so host app can update location in its store
  // TODO: Remove when all modules are using new events and we don't need to rely on app's store
  private dispatchUpdateLocation = (
    route: string,
    selectedItems: SelectedItems = {},
    scopes: string[] = [],
    customDimensions: VariableData = {},
    shouldTrack = false
  ) => {
    const eventLocation = this.buildEventLocation(route);
    const updateLocationPayload: UpdateLocationPayload = {
      angularRoute: eventLocation.virtualPageName,
      routeWithQueryString: eventLocation.path,
      hostName: eventLocation.hostName,
      domain: '',
      fullPath: eventLocation.url,
      model: { details: { scopes } },
      customDimensions,
      selectedItems
    };
    const updateLocationAction = updateLocation(updateLocationPayload, shouldTrack);
    this.eventBus.dispatch(updateLocationAction);
  }

  private getRouterRoute = () => {
    const rootSnapshot = this.router.routerState.root.snapshot;
    return this.getRouteFromSnapshot(rootSnapshot);
  }

  private getFormattedQueryString = (queryParamMap: ParamMap): string => {
    let httpParams = new HttpParams();

    if (queryParamMap == null) {
      return '';
    }
    queryParamMap.keys.forEach(function(key) {
      httpParams = httpParams.append(key, queryParamMap.get(key) || '');
    });

    return httpParams.toString() ? '?' + httpParams.toString() : '';
  }

  private getRouteFromSnapshot = function(snapshot: ActivatedRouteSnapshot) {
    if (snapshot == null) {
      return '';
    }
    const route = snapshot.routeConfig && snapshot.routeConfig.path ? '/' + snapshot.routeConfig.path : '';
    return route + this.getRouteFromSnapshot(snapshot.firstChild);
  };

  private buildEventLocation = (route: string, queryString: string = ''): any => {
    const virtualPageName = route.substr(0, route.indexOf('?')) || route;

    return {
      hitId: this.currentLocation.hitId + 1,
      hostName: this.hostName,
      path: route + queryString,
      url: this.hostName + route + queryString,
      queryString,
      virtualPageName
    };
  }
}
