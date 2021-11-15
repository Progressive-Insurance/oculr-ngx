/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { NavigationEnd, convertToParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { LocationTrackingService } from './location-tracking.service';

describe('LocationTrackingService', () => {
  let locationTrackingService: LocationTrackingService;
  let mockLocation: any;
  let mockWindowService: any;
  let mockRouter: any;
  let mockRouterUtilityService: any;
  let mockQueryParamMap: any;

  beforeEach(() => {
    mockLocation = jasmine.createSpyObj('mockLocation', ['path']);
    mockRouterUtilityService = {
      getSnapshotHierarchyAsArray: () => {
        return [{ routeConfig: { path: '/home' }, paramMap: {} }];
      },
      insertLocationParams: () => {
        return {
          hitId: 1,
          hostName: 'https://example.org/slot5/src',
          path: '/new-modal/123?term=current',
          url: 'https://example.org/slot5/src/new-modal/123?term=current',
          queryString: '?term=current',
          virtualPageName: '/new-modal/123',
        };
      },
    };
  });

  describe('constructor', () => {
    describe('when url contains no query parameters and no # url fragment is present', () => {
      it('should set hostname', () => {
        mockLocation.path.and.returnValue('');
        mockWindowService = { url: 'https://example.org' };
        mockQueryParamMap = convertToParamMap({});

        mockRouter = {
          events: new BehaviorSubject(null),
          routerState: {
            root: {
              snapshot: {
                routeConfig: null,
                firstChild: null,
                queryParamMap: mockQueryParamMap,
              },
            },
          },
        };

        locationTrackingService = new LocationTrackingService(
          mockLocation,
          mockWindowService,
          mockRouter,
          mockRouterUtilityService
        );

        const routerEvent = new NavigationEnd(1, '', '/access/login');
        mockRouter.routerState.root.snapshot.firstChild = {
          routeConfig: {
            path: 'access/login',
          },
        };
        mockLocation.path.and.returnValue('/access/login');
        mockWindowService.url = 'https://example.org/access/login';
        mockRouter.events.next(routerEvent);

        expect(locationTrackingService.location.hostName).toEqual('https://example.org');
      });
    });
    describe('when url contains query string parameters', () => {
      it('should set hostname', () => {
        mockLocation.path.and.returnValue('?brand=Progressive');
        mockWindowService = { url: 'https://example.org?brand=Progressive' };
        mockQueryParamMap = convertToParamMap({ brand: 'Progressive' });

        mockRouter = {
          events: new BehaviorSubject(null),
          routerState: {
            root: {
              snapshot: {
                routeConfig: null,
                firstChild: null,
                queryParamMap: mockQueryParamMap,
              },
            },
          },
        };

        locationTrackingService = new LocationTrackingService(
          mockLocation,
          mockWindowService,
          mockRouter,
          mockRouterUtilityService
        );

        const routerEvent = new NavigationEnd(1, '?brand=Progressive', '/access/login?brand=Progressive');
        mockRouter.routerState.root.snapshot.firstChild = {
          routeConfig: {
            path: '/access/login',
          },
        };
        mockLocation.path.and.returnValue('/access/login?brand=Progressive');
        mockWindowService.url = 'https://example.org/access/login?brand=Progressive';
        mockRouter.events.next(routerEvent);

        expect(locationTrackingService.location.hostName).toEqual('https://example.org');
      });
    });

    describe('when url contains # url fragment', () => {
      it('should set hostname', () => {
        mockLocation.path.and.returnValue('#top');
        mockWindowService = { url: 'https://example.org#top' };
        mockQueryParamMap = convertToParamMap({});

        mockRouter = {
          events: new BehaviorSubject(null),
          routerState: {
            root: {
              snapshot: {
                routeConfig: null,
                firstChild: null,
                queryParamMap: mockQueryParamMap,
              },
            },
          },
        };

        locationTrackingService = new LocationTrackingService(
          mockLocation,
          mockWindowService,
          mockRouter,
          mockRouterUtilityService
        );

        const routerEvent = new NavigationEnd(1, '#top', '/access/login#top');
        mockRouter.routerState.root.snapshot.firstChild = {
          routeConfig: {
            path: '/access/login',
          },
        };
        mockLocation.path.and.returnValue('/access/login#top');
        mockWindowService.url = 'https://example.org/access/login#top';
        mockRouter.events.next(routerEvent);

        expect(locationTrackingService.location.hostName).toEqual('https://example.org');
      });
    });

    describe('when url contains query string parameters and # url fragment', () => {
      it('should set hostname', () => {
        mockLocation.path.and.returnValue('?brand=Progressive#top');
        mockWindowService = { url: 'https://example.org?brand=Progressive#top' };
        mockQueryParamMap = convertToParamMap({ brand: 'Progressive' });

        mockRouter = {
          events: new BehaviorSubject(null),
          routerState: {
            root: {
              snapshot: {
                routeConfig: null,
                firstChild: null,
                queryParamMap: mockQueryParamMap,
              },
            },
          },
        };

        locationTrackingService = new LocationTrackingService(
          mockLocation,
          mockWindowService,
          mockRouter,
          mockRouterUtilityService
        );

        const routerEvent = new NavigationEnd(1, '?brand=Progressive#top', '/access/login?brand=Progressive#top');
        mockRouter.routerState.root.snapshot.firstChild = {
          routeConfig: {
            path: '/access/login',
          },
        };
        mockLocation.path.and.returnValue('/access/login?brand=Progressive#top');
        mockWindowService.url = 'https://example.org/access/login?brand=Progressive#top';
        mockRouter.events.next(routerEvent);

        expect(locationTrackingService.location.hostName).toEqual('https://example.org');
      });
    });
  });

  describe('after instantiation', () => {
    beforeEach(() => {
      mockLocation.path.and.returnValue('/home');
      mockWindowService = { url: 'https://example.org/slot5/src/home' };
      mockQueryParamMap = convertToParamMap({ term: 'current' });

      mockRouter = {
        events: new BehaviorSubject(null),
        routerState: {
          root: {
            snapshot: {
              routeConfig: null,
              firstChild: {
                routeConfig: {
                  path: 'home',
                },
                firstChild: null,
              },
              queryParamMap: mockQueryParamMap,
            },
          },
        },
      };

      locationTrackingService = new LocationTrackingService(
        mockLocation,
        mockWindowService,
        mockRouter,
        mockRouterUtilityService
      );
    });
    describe('when changing to a new location via Angular Router', () => {
      beforeEach(() => {
        const routerEvent = new NavigationEnd(
          1,
          '/id-card-hub/12345678/id-card?term=current',
          '/id-card-hub/12345678/id-card?term=current'
        );
        mockRouter.routerState.root.snapshot.firstChild = {
          routeConfig: {
            path: 'id-card-hub',
          },
          firstChild: {
            routeConfig: {
              path: ':policyNumber/id-card',
            },
            firstChild: null,
          },
        };
        mockLocation.path.and.returnValue('/id-card-hub/12345678/id-card');
        mockWindowService.url = 'https://example.org/slot5/src/id-card-hub/12345678/id-card?term=current';
        mockRouter.events.next(routerEvent);
      });
      it('sets current location', () => {
        const expectedLocation = {
          hitId: 1,
          hostName: 'https://example.org/slot5/src',
          path: '/id-card-hub/:policyNumber/id-card?term=current',
          url: 'https://example.org/slot5/src/id-card-hub/:policyNumber/id-card?term=current',
          queryString: '?term=current',
          virtualPageName: '/id-card-hub/:policyNumber/id-card',
        };
        expect(locationTrackingService.location).toEqual(expectedLocation);
      });
    });

    describe('sets current location with no querystring', () => {
      beforeEach(() => {
        mockRouter.routerState.root.snapshot.firstChild = {
          routeConfig: {
            path: 'id-card-hub',
          },
          firstChild: {
            routeConfig: {
              path: ':policyNumber/id-card',
            },
            firstChild: null,
          },
        };
        mockRouter.routerState.root.snapshot.queryParamMap = convertToParamMap({});
        mockLocation.path.and.returnValue('/id-card-hub/12345678/id-card');
        mockWindowService.url = 'https://example.org/slot5/src/id-card-hub/12345678/id-card';
      });
      describe('when changing to a new location with no querystring in URL', () => {
        beforeEach(() => {
          const routerEvent = new NavigationEnd(1, '/id-card-hub/12345678/id-card', '/id-card-hub/12345678/id-card');
          mockRouter.events.next(routerEvent);
        });
        it('sets current location with querystring field undefined', () => {
          const expectedLocation = {
            hitId: 1,
            hostName: 'https://example.org/slot5/src',
            path: '/id-card-hub/:policyNumber/id-card',
            url: 'https://example.org/slot5/src/id-card-hub/:policyNumber/id-card',
            queryString: '',
            virtualPageName: '/id-card-hub/:policyNumber/id-card',
          };
          expect(locationTrackingService.location).toEqual(expectedLocation);
        });
      });
    });

    describe('updateRouteConfig', () => {
      beforeEach(() => {
        const routerEvent = new NavigationEnd(
          1,
          '/id-card-hub/12345678/id-card?term=current',
          '/id-card-hub/12345678/id-card?term=current'
        );
        mockRouter.routerState.root.snapshot.firstChild = {
          routeConfig: {
            path: 'id-card-hub',
          },
          firstChild: {
            routeConfig: {
              path: ':policyNumber/id-card',
            },
            paramMap: convertToParamMap({ policyNumber: '12345678' }),
            firstChild: null,
          },
        };
        mockLocation.path.and.returnValue('/id-card-hub/12345678/id-card?term=current');
        mockWindowService.url = 'https://example.org/slot5/src/id-card-hub/12345678/id-card?term=current';
        mockRouter.events.next(routerEvent);
      });
      it('updates the location based on pre-loaded paramMap and config provided', () => {
        mockRouterUtilityService.insertLocationParams = () => {
          return {
            hitId: 1,
            hostName: 'https://example.org/slot5/src',
            path: '/id-card-hub/12345678/id-card?term=current',
            url: 'https://example.org/slot5/src/id-card-hub/12345678/id-card?term=current',
            queryString: '?term=current',
            virtualPageName: '/id-card-hub/12345678/id-card',
          };
        };
        const config = { replaceParamTokens: ['policyNumber'] };
        const expectedLocation = {
          hitId: 1,
          hostName: 'https://example.org/slot5/src',
          path: '/id-card-hub/12345678/id-card?term=current',
          url: 'https://example.org/slot5/src/id-card-hub/12345678/id-card?term=current',
          queryString: '?term=current',
          virtualPageName: '/id-card-hub/12345678/id-card',
        };
        locationTrackingService.updateRouteConfig(config);
        expect(locationTrackingService.location).toEqual(expectedLocation);
      });
      it('updates nothing if config is empty', () => {
        mockRouterUtilityService.insertLocationParams = () => {
          return {
            hitId: 1,
            hostName: 'https://example.org/slot5/src',
            path: '/id-card-hub/:policyNumber/id-card?term=current',
            url: 'https://example.org/slot5/src/id-card-hub/:policyNumber/id-card?term=current',
            queryString: '?term=current',
            virtualPageName: '/id-card-hub/:policyNumber/id-card',
          };
        };
        const expectedLocation = {
          hitId: 1,
          hostName: 'https://example.org/slot5/src',
          path: '/id-card-hub/:policyNumber/id-card?term=current',
          url: 'https://example.org/slot5/src/id-card-hub/:policyNumber/id-card?term=current',
          queryString: '?term=current',
          virtualPageName: '/id-card-hub/:policyNumber/id-card',
        };
        locationTrackingService.updateRouteConfig(undefined);
        expect(locationTrackingService.location).toEqual(expectedLocation);
      });
    });
  });
});
