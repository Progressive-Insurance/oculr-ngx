/*
 * @license
 * Copyright (c) 2025 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found at
 * https://opensource.progressive.com/resources/license
*/

import { HashLocationStrategy, Location, LocationStrategy, PathLocationStrategy, PlatformLocation } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { ActivatedRouteSnapshot, convertToParamMap, ParamMap, Router } from '@angular/router';
import { LocationService } from './location.service';

describe('LocationService', () => {
    let locationService: LocationService;
    let mockLocation: any;
    let mockWindowService: any;
    let mockQueryParamMap: any;
    let mockParamMap: any;
    let mockRouter: any;

    beforeEach(() => {
        mockLocation = {
            path: vi.fn().mockName("mockLocation.path"),
            prepareExternalUrl: vi.fn().mockName("mockLocation.prepareExternalUrl")
        };
        mockLocation.path.mockReturnValue('/home');
        mockLocation.prepareExternalUrl.mockReturnValue('/');
        mockWindowService = { location: { href: 'https://example.org/home' } };
        mockQueryParamMap = convertToParamMap({});
        mockParamMap = convertToParamMap({ licenses: 'approved' });
        mockRouter = {
            routerState: {
                root: {
                    snapshot: {
                        routeConfig: { path: 'innersource' },
                        firstChild: { routeConfig: { path: 'catalog' }, paramMap: mockParamMap },
                        queryParamMap: mockQueryParamMap,
                    },
                },
            },
        };
        locationService = new LocationService(mockLocation, mockWindowService, mockRouter);
    });

    describe('constructor', () => {
        it('should set hostname', () => {
            expect(locationService['hostName']).toEqual('https://example.org');
        });
    });

    describe('getLocation', () => {
        it('provides an EventLocation using the root snapshot if one is not provided', () => {
            const expected: any = {
                hostName: 'https://example.org',
                path: '/innersource/catalog',
                url: 'https://example.org/innersource/catalog',
                queryString: '',
                virtualPageName: '/innersource/catalog',
            };
            const result = locationService.getLocation();
            expect(result).toEqual(expected);
        });
    });

    describe('getLocation with repeated query parameters', () => {
        function buildService(queryParamMap: ParamMap | null): LocationService {
            const location: any = {
                path: vi.fn().mockName('mockLocation.path'),
                prepareExternalUrl: vi.fn().mockName('mockLocation.prepareExternalUrl'),
            };
            location.path.mockReturnValue('/home');
            location.prepareExternalUrl.mockReturnValue('/');
            const windowService: any = { location: { href: 'https://example.org/home' } };
            const router: any = {
                routerState: {
                    root: {
                        snapshot: {
                            routeConfig: { path: 'home' },
                            firstChild: null,
                            queryParamMap,
                        },
                    },
                },
            };
            return new LocationService(location, windowService, router);
        }

        it('keeps every value of a repeated key in queryString, path, and url', () => {
            const service = buildService(convertToParamMap({ tag: ['alpha', 'beta'] }));
            const result = service.getLocation();
            expect(result.queryString).toEqual('?tag=alpha&tag=beta');
            expect(result.path).toEqual('/home?tag=alpha&tag=beta');
            expect(result.url).toEqual('https://example.org/home?tag=alpha&tag=beta');
            expect(result.virtualPageName).toEqual('/home');
        });

        it('keeps all values of multiple keys, including repeated empty strings', () => {
            const service = buildService(convertToParamMap({ a: '1', b: ['', ''], c: 'x' }));
            const result = service.getLocation();
            expect(result.queryString).toEqual('?a=1&b=&b=&c=x');
            expect(result.path).toEqual('/home?a=1&b=&b=&c=x');
            expect(result.url).toEqual('https://example.org/home?a=1&b=&b=&c=x');
        });

        it('escapes special characters and round-trips through HttpParams', () => {
            const service = buildService(convertToParamMap({ q: 'a b & c=d', u: 'héllo' }));
            const result = service.getLocation();
            expect(result.queryString).toEqual('?q=a%20b%20%26%20c=d&u=h%C3%A9llo');
            const parsed = new HttpParams({ fromString: result.queryString.substring(1) });
            expect(parsed.get('q')).toEqual('a b & c=d');
            expect(parsed.get('u')).toEqual('héllo');
        });

        it('keeps virtualPageName independent of the query string', () => {
            const service = buildService(convertToParamMap({ tag: ['alpha', 'beta'] }));
            const result = service.getLocation();
            expect(result.virtualPageName).toEqual('/home');
        });

        it('produces an empty query string without a trailing ? for an empty parameter map', () => {
            const service = buildService(convertToParamMap({}));
            const result = service.getLocation();
            expect(result.queryString).toEqual('');
            expect(result.path).toEqual('/home');
            expect(result.url).toEqual('https://example.org/home');
        });

        it('produces an empty query string without a trailing ? for a missing parameter map', () => {
            const service = buildService(null);
            const result = service.getLocation();
            expect(result.queryString).toEqual('');
            expect(result.path).toEqual('/home');
            expect(result.url).toEqual('https://example.org/home');
        });

        it('keeps the single-value result unchanged', () => {
            const service = buildService(convertToParamMap({ licenses: 'approved' }));
            const result = service.getLocation();
            expect(result.queryString).toEqual('?licenses=approved');
            expect(result.path).toEqual('/home?licenses=approved');
            expect(result.url).toEqual('https://example.org/home?licenses=approved');
        });
    });

    describe('getCurrentRoute', () => {
        it('should construct a ParameterizedRoute object given a root snapshot', () => {
            const expected = {
                route: '/innersource/catalog',
                queryParamMap: mockQueryParamMap,
                paramMap: mockParamMap,
            };
            const result = locationService['getCurrentRoute'](mockRouter.routerState.root.snapshot);
            expect(result).toEqual(expected);
        });
    });

    describe('getRouteFromSnapshot', () => {
        it('should return an empty string when no snapshot is provided', () => {
            const snapshot: any = null;
            const result = locationService['getRouteFromSnapshot'](snapshot);
            const expected = '';
            expect(result).toEqual(expected);
        });

        it('should return an empty string if no routeConfig exists', () => {
            const snapshot: any = { value: {} };
            const result = locationService['getRouteFromSnapshot'](snapshot);
            const expected = '';
            expect(result).toEqual(expected);
        });

        it('should return an empty string if no path exists', () => {
            const snapshot: any = { routeConfig: { value: '' } };
            const result = locationService['getRouteFromSnapshot'](snapshot);
            const expected = '';
            expect(result).toEqual(expected);
        });

        it('should return a well-formed route when a path exists', () => {
            const result = locationService['getRouteFromSnapshot'](mockRouter.routerState.root.snapshot);
            const expected = '/innersource/catalog';
            expect(result).toEqual(expected);
        });
    });

    describe('getSnapshotHierarchyAsArray', () => {
        it('converts a nested object hierarchy to an array', () => {
            const snapshot: any = {
                outlet: 'one',
                firstChild: {
                    outlet: 'child-of-one',
                    firstChild: {
                        outlet: 'child-of-child-of-one',
                    },
                },
            };
            const expected = [snapshot, snapshot.firstChild, snapshot.firstChild.firstChild];
            const result = locationService['getSnapshotHierarchyAsArray']([snapshot]);
            expect(result).toEqual(expected);
        });

        it('does nothing if there are no children', () => {
            const snapshot: any = {
                outlet: 'one',
                firstChild: null,
            };
            const expected = [snapshot];
            const result = locationService['getSnapshotHierarchyAsArray']([snapshot]);
            expect(result).toEqual(expected);
        });
    });

    describe('getFormattedQueryString', () => {
        it('should return an empty string if no param map is provided', () => {
            const paramMap: any = null;
            const expected = '';
            const result = locationService['getFormattedQueryString'](paramMap);
            expect(result).toEqual(expected);
        });

        it('should return the query string when there are params provided', () => {
            const paramMap = convertToParamMap({ licenses: 'approved' });
            const expected = '?licenses=approved';
            const result = locationService['getFormattedQueryString'](paramMap);
            expect(result).toEqual(expected);
        });

        it('should return every value of a repeated key in order', () => {
            const paramMap = convertToParamMap({ tag: ['alpha', 'beta'] });
            const expected = '?tag=alpha&tag=beta';
            const result = locationService['getFormattedQueryString'](paramMap);
            expect(result).toEqual(expected);
        });
    });

    describe('host name derivation with real location strategies', () => {
        // Platform-location fixture modeled on the browser URL; only pathname, search, and
        // hash matter to the strategies, and listener registration is a no-op.
        function createPlatformLocation(href: string): PlatformLocation {
            const url = new URL(href);
            return {
                pathname: url.pathname,
                search: url.search,
                hash: url.hash,
                onPopState: () => () => undefined,
                onHashChange: () => () => undefined,
            } as unknown as PlatformLocation;
        }

        function createWindow(href: string): Window {
            return { location: { href } } as unknown as Window;
        }

        function createSnapshot(path: string, queryParamMap: ParamMap = convertToParamMap({})): ActivatedRouteSnapshot {
            return {
                routeConfig: { path },
                firstChild: null,
                paramMap: convertToParamMap({}),
                queryParamMap,
            } as unknown as ActivatedRouteSnapshot;
        }

        function createRouter(path: string, queryParamMap: ParamMap = convertToParamMap({})): Router {
            return {
                routerState: {
                    root: {
                        snapshot: createSnapshot(path, queryParamMap),
                    },
                },
            } as unknown as Router;
        }

        function buildService(href: string, strategy: LocationStrategy, path: string, queryParamMap?: ParamMap): LocationService {
            const routerLocation = new Location(strategy);
            return new LocationService(routerLocation, createWindow(href), createRouter(path, queryParamMap));
        }

        it('drops the index document and base path when a path-strategy app loads an entry document', () => {
            const href = 'https://example.org/app/index.html';
            const strategy = new PathLocationStrategy(createPlatformLocation(href), '/app/');
            const routerLocation = new Location(strategy);
            // Angular normalizes the terminal index document and the base path away
            expect(routerLocation.path(true)).toEqual('');
            const service = new LocationService(routerLocation, createWindow(href), createRouter('home'));
            const result = service.getLocation();
            expect(service['hostName']).toEqual('https://example.org/app');
            expect(result.path).toEqual('/home');
            expect(result.url).toEqual('https://example.org/app/home');
            expect(result.virtualPageName).toEqual('/home');
        });

        it('keeps the document slash before the hash delimiter for a hash-strategy route', () => {
            const href = 'https://example.org/app/#/home';
            const strategy = new HashLocationStrategy(createPlatformLocation(href));
            const routerLocation = new Location(strategy);
            expect(routerLocation.path(true)).toEqual('/home');
            const service = new LocationService(routerLocation, createWindow(href), createRouter('home'));
            const result = service.getLocation();
            expect(service['hostName']).toEqual('https://example.org/app/#');
            expect(result.path).toEqual('/home');
            expect(result.url).toEqual('https://example.org/app/#/home');
            expect(result.url).not.toContain('//#');
            expect(result.url).not.toContain('#//');
        });

        it('does not duplicate the hash route separator for a hash-strategy route with a trailing slash', () => {
            const href = 'https://example.org/app/#/home/';
            const strategy = new HashLocationStrategy(createPlatformLocation(href));
            const routerLocation = new Location(strategy);
            // the strategy observes the trailing slash; Location normalizes it away
            expect(strategy.path(true)).toEqual('/home/');
            expect(routerLocation.path(true)).toEqual('/home');
            const service = new LocationService(routerLocation, createWindow(href), createRouter('home'));
            const result = service.getLocation();
            expect(service['hostName']).toEqual('https://example.org/app/#');
            expect(result.path).toEqual('/home');
            expect(result.url).toEqual('https://example.org/app/#/home');
            expect(result.url).not.toContain('//#');
            expect(result.url).not.toContain('#//');
        });

        it('resolves a root deployment to the origin', () => {
            const href = 'https://example.org/';
            const service = buildService(href, new PathLocationStrategy(createPlatformLocation(href), '/'), 'home');
            const result = service.getLocation();
            expect(service['hostName']).toEqual('https://example.org');
            expect(result.url).toEqual('https://example.org/home');
        });

        it('keeps the deployment subpath for a normal path beneath /app/', () => {
            const href = 'https://example.org/app/home';
            const service = buildService(href, new PathLocationStrategy(createPlatformLocation(href), '/app/'), 'home');
            const result = service.getLocation();
            expect(service['hostName']).toEqual('https://example.org/app');
            expect(result.path).toEqual('/home');
            expect(result.url).toEqual('https://example.org/app/home');
        });

        it('ignores browser query parameters and fragments when deriving the prefix', () => {
            const href = 'https://example.org/app/home?ref=nav#summary';
            const service = buildService(
                href,
                new PathLocationStrategy(createPlatformLocation(href), '/app/'),
                'home',
                convertToParamMap({ tag: ['alpha'] })
            );
            const result = service.getLocation();
            expect(service['hostName']).toEqual('https://example.org/app');
            expect(result.queryString).toEqual('?tag=alpha');
            expect(result.path).toEqual('/home?tag=alpha');
            expect(result.url).toEqual('https://example.org/app/home?tag=alpha');
        });

        it('keeps reporting the base prefix after navigating away from an index document', () => {
            const href = 'https://example.org/app/index.html';
            const routerLocation = new Location(new PathLocationStrategy(createPlatformLocation(href), '/app/'));
            const windowService = createWindow(href);
            const service = new LocationService(routerLocation, windowService, createRouter('home'));
            expect(service.getLocation().url).toEqual('https://example.org/app/home');
            // the browser URL follows the router navigation
            windowService.location.href = 'https://example.org/app/dashboard';
            const navigated = service.getLocation(createSnapshot('dashboard'));
            expect(navigated.hostName).toEqual('https://example.org/app');
            expect(navigated.url).toEqual('https://example.org/app/dashboard');
        });

        it('keeps parameterized route templates in the reported path', () => {
            const href = 'https://example.org/app/orders/42';
            const service = buildService(href, new PathLocationStrategy(createPlatformLocation(href), '/app/'), 'orders/:id');
            const result = service.getLocation();
            expect(result.path).toEqual('/orders/:id');
            expect(result.url).toEqual('https://example.org/app/orders/:id');
            expect(result.virtualPageName).toEqual('/orders/:id');
        });
    });
});
