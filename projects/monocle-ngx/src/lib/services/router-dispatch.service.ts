import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRouteSnapshot, NavigationEnd, Router, convertToParamMap } from '@angular/router';
import { Subject, Observable, of } from 'rxjs';
import { distinctUntilChanged, filter, map, scan, merge, switchMap, withLatestFrom } from 'rxjs/operators';

import { EVENT_TYPES } from '../event-types';
import { WindowService } from './window.service';
import { AnalyticsAction } from '../models/actions/analytics-action.enum';
import { SelectedItems } from '../models/selected-items.interface';
import { UpdateLocationPayload } from '../models/update-location-payload.interface';
import {
  AdditionalScopes,
  RouterEvent,
  VirtualPageStack,
  VirtualPageStackAction,
} from '../models/router-dispatch.interface';
import { snapshotHasReplaceParamTokens } from '../models/snapshot-with-replace-tokens.interface';
import { UpdateLocationAction } from '../models/actions/update-location-action.interface';
import { AnalyticsEventBusService } from './analytics-event-bus.service';
import { EventCacheService } from './event-cache.service';
import { RouterUtilityService } from './router-utility.service';

export const virtualPageStackReducer = (acc: any[], value: VirtualPageStackAction) => {
  switch (value.type) {
    case 'push':
      return [
        ...acc,
        {
          location: value.url,
          additionalScopes: value.additionalScopes,
          selectedItems: value.selectedItems,
          customDimensions: value.customDimensions,
          shouldTrack: value.shouldTrack != null ? value.shouldTrack : true,
          shouldIncludeAppScope: true,
        },
      ];
    case 'pop':
      return acc.slice(0, acc.length - 1);
    case 'clear':
      const cleared: VirtualPageStack[] = [];
      return cleared;
    default:
      return acc;
  }
};

const getDeepestSnapshot = (snapshot: ActivatedRouteSnapshot): ActivatedRouteSnapshot =>
  snapshot.firstChild ? getDeepestSnapshot(snapshot.firstChild) : snapshot;

@Injectable()
export class RouterDispatchService {
  virtualRoute: Subject<VirtualPageStackAction> = new Subject();
  constructor(
    private router: Router,
    private location: Location,
    private windowService: WindowService,
    private eventBus: AnalyticsEventBusService,
    private eventCache: EventCacheService,
    private routerUtility: RouterUtilityService
  ) {}

  initialize() {
    const additionalScopes$: Observable<AdditionalScopes> = this.router.events.pipe(
      filter((n) => n instanceof NavigationEnd),
      switchMap((): Observable<AdditionalScopes> => {
        return of(this.getAdditionalScopes(this.router));
      })
    );

    const shouldTrack$: Observable<boolean> = this.router.events.pipe(
      filter((n) => n instanceof NavigationEnd),
      switchMap((): Observable<boolean> => {
        return of(this.shouldTrack(this.router));
      })
    );

    const shouldIncludeAppScope$: Observable<boolean> = this.router.events.pipe(
      filter((n) => n instanceof NavigationEnd),
      switchMap((): Observable<boolean> => {
        return of(this.shouldIncludeAppScope(this.router));
      })
    );

    const prettyRouteName$: Observable<string | undefined> = this.router.events.pipe(
      filter((n) => n instanceof NavigationEnd),
      switchMap((): Observable<string | undefined> => {
        return of(this.getPrettyRouteName(this.router));
      })
    );

    const selectedRouteParamsItems$: Observable<Object> = this.router.events.pipe(
      filter((n) => n instanceof NavigationEnd),
      switchMap((): Observable<Object> => {
        return of(this.getSelectedRouteParamsItems(this.router));
      })
    );

    const clearEvents$: Observable<VirtualPageStackAction> = this.router.events.pipe(
      filter((n) => n instanceof NavigationEnd),
      map<any, VirtualPageStackAction>(() => ({ type: 'clear' }))
    );

    const routerEvents$: Observable<RouterEvent> = this.router.events.pipe(
      filter((evt) => evt instanceof NavigationEnd),
      map(() => this.location.path()),
      filter((n) => typeof n !== 'undefined'),
      distinctUntilChanged(),
      withLatestFrom(additionalScopes$, selectedRouteParamsItems$, shouldTrack$, shouldIncludeAppScope$),
      map<any, RouterEvent>(
        ([location, additionalScopes, selectedItems, shouldTrack, shouldIncludeAppScope]: [
          string,
          AdditionalScopes,
          SelectedItems,
          boolean,
          boolean
        ]) => {
          const currentHostName = this.getHostName(this.windowService.url, location);
          const url = this.windowService.url;
          const domain = this.windowService.hostName;
          const result: RouterEvent = {
            location,
            currentHostName,
            domain,
            url,
            additionalScopes,
            selectedItems,
            shouldTrack,
            shouldIncludeAppScope,
          };
          return result;
        }
      ),
      withLatestFrom(prettyRouteName$),
      map(([routerEvent, prettyName]) => {
        if (prettyName) {
          prettyName = prettyName.indexOf('/') === 0 ? prettyName : `/${prettyName}`;
          const event = {
            ...routerEvent,
            location: routerEvent.location.replace(routerEvent.location, prettyName),
            url: routerEvent.url.replace(routerEvent.location, prettyName),
          };
          return event;
        } else {
          return routerEvent;
        }
      })
    );

    const virtualEvents$: Observable<RouterEvent> = this.virtualRoute.pipe(
      merge(clearEvents$),
      map((event) => this.normalizeUrl(event)),
      scan<VirtualPageStackAction, VirtualPageStack[]>(virtualPageStackReducer, [] as VirtualPageStack[]),
      map((n) => n[n.length - 1] || { location: undefined, additionalScopes: undefined }),
      distinctUntilChanged((a, b) => a.location === b.location),
      withLatestFrom(routerEvents$, (vps, routerEvent): RouterEvent => {
        const result: RouterEvent = {
          location: vps.location || routerEvent.location,
          currentHostName: routerEvent.currentHostName,
          url: vps.location ? routerEvent.currentHostName + vps.location : routerEvent.url,
          domain: routerEvent.domain,
          additionalScopes: vps.additionalScopes || (routerEvent.additionalScopes as string[]),
          selectedItems: vps.selectedItems || routerEvent.selectedItems,
          customDimensions: vps.customDimensions || routerEvent.customDimensions,
          shouldTrack: vps.shouldTrack != null ? vps.shouldTrack : routerEvent.shouldTrack,
          shouldIncludeAppScope: vps.shouldIncludeAppScope || routerEvent.shouldIncludeAppScope,
        };
        return result;
      })
    );

    routerEvents$
      .pipe(
        merge(virtualEvents$),
        distinctUntilChanged((a, b) => a.location === b.location),
        map(
          ({
            location,
            currentHostName,
            url,
            domain,
            additionalScopes,
            selectedItems,
            customDimensions,
            shouldTrack,
            shouldIncludeAppScope,
          }) => {
            const routeWithQueryString = location;
            const angularRoute = location.substr(0, location.indexOf('?')) || location;
            const scopes = shouldIncludeAppScope ? ['AppLevelScope', ...additionalScopes] : [...additionalScopes];
            const payload: UpdateLocationPayload = {
              angularRoute,
              routeWithQueryString,
              hostName: currentHostName,
              domain,
              fullPath: url,
              model: { details: { scopes } },
              selectedItems: selectedItems,
              customDimensions,
            };
            return this.updateLocation(payload, shouldTrack);
          }
        )
      )
      .subscribe((action) => {
        this.eventBus.dispatch(action);
        this.eventCache.cacheEvent(action);
      });
  }

  getAdditionalScopes = (router: Router): AdditionalScopes => {
    const snapshot = getDeepestSnapshot(router.routerState.root.snapshot);

    if (snapshot.data && snapshot.data.analytics) {
      return snapshot.data.analytics.additionalScopes || [];
    } else {
      return [] as AdditionalScopes;
    }
  };

  shouldTrack = (router: Router): boolean => {
    const snapshot = getDeepestSnapshot(router.routerState.root.snapshot);
    return !!snapshot.data && !!snapshot.data.analytics ? !snapshot.data.analytics.disableAutoPageViewEvent : true;
  };

  shouldIncludeAppScope = (router: Router): boolean => {
    const snapshot = getDeepestSnapshot(router.routerState.root.snapshot);
    return !!snapshot.data && !!snapshot.data.analytics ? !snapshot.data.analytics.excludeAppScope : true;
  };

  getPrettyRouteName = (router: Router): string | undefined => {
    const snapshot = this.routerUtility.getSnapshotHierarchyAsArray([router.routerState.root.snapshot]).reduce(
      (acc, snapshotFragment) => {
        const nextPath =
          snapshotFragment.routeConfig && snapshotFragment.routeConfig.path
            ? '/' + snapshotFragment.routeConfig.path
            : '';
        const path = acc.routeConfig.path + nextPath;
        return {
          paramMap: snapshotFragment.paramMap,
          routeConfig: {
            ...(snapshotFragment.routeConfig || {}),
            path,
          },
        };
      },
      { paramMap: convertToParamMap({}), routeConfig: { path: '' } }
    ) as ActivatedRouteSnapshot;
    if (snapshot.routeConfig && snapshot.paramMap.keys.length >= 1) {
      if (snapshotHasReplaceParamTokens(snapshot)) {
        return this.routerUtility.replaceTokensWithValuesFromParamMap(
          snapshot.routeConfig.path,
          snapshot.paramMap,
          snapshot.routeConfig.data.analytics.replaceParamTokens
        );
      } else {
        return snapshot.routeConfig ? snapshot.routeConfig.path : undefined;
      }
    } else {
      return undefined;
    }
  };

  getSelectedRouteParamsItems = (router: Router): SelectedItems => {
    const selectedItems: SelectedItems = {};
    const snapshot = getDeepestSnapshot(router.routerState.root.snapshot);

    if (!snapshot.paramMap) {
      return selectedItems;
    }
    const paramMap = snapshot.paramMap;

    paramMap.keys.forEach((keyName: string) => {
      const val = paramMap.get(keyName);
      if (val) {
        selectedItems[keyName] = val;
      }
    });

    return selectedItems;
  };

  private updateLocation(payload: UpdateLocationPayload, shouldTrack: boolean) {
    const updateLocationAction: UpdateLocationAction = {
      type: AnalyticsAction.UPDATE_LOCATION,
      payload,
      meta: {
        track: shouldTrack,
        trackAs: EVENT_TYPES.page,
      },
    };
    return updateLocationAction;
  }

  private normalizeUrl(event: VirtualPageStackAction): VirtualPageStackAction {
    const hasLeadingSlash = (input: string | undefined) => input && input.indexOf('/') === 0;
    return event && !hasLeadingSlash(event.url) ? (event = { ...event, url: `/${event.url}` }) : event;
  }

  private getHostName(url: string, path: string) {
    if (path.charAt(0) !== '/') {
      return url;
    }
    const index = url.indexOf(path);
    if (index === -1) {
      return url;
    }
    return url.slice(0, index);
  }
}
