/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { convertToParamMap } from '@angular/router';
import { LocationService } from './location.service';

describe('LocationTrackingService', () => {
  let locationTrackingService: LocationService;
  let mockLocation: any;
  let mockWindowService: any;
  let mockQueryParamMap: any;
  let mockParamMap: any;
  let mockRouter: any;

  beforeEach(() => {
    mockLocation = jasmine.createSpyObj('mockLocation', ['path']);
    mockLocation.path.and.returnValue('/home');
    mockWindowService = { url: 'https://example.org/home' };
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
    locationTrackingService = new LocationService(mockLocation, mockWindowService, mockRouter);
  });

  describe('constructor', () => {
    it('should set hostname', () => {
      expect(locationTrackingService['hostName']).toEqual('https://example.org');
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
      const result = locationTrackingService.getLocation();
      console.log(result);
      expect(result).toEqual(expected);
    });
  });

  describe('getCurrentRoute', () => {
    it('should construct a ParameterizedRoute object given a root snapshot', () => {
      const expected = {
        route: '/innersource/catalog',
        queryParamMap: mockQueryParamMap,
        paramMap: mockParamMap,
      };
      const result = locationTrackingService['getCurrentRoute'](mockRouter.routerState.root.snapshot);
      expect(result).toEqual(expected);
    });
  });

  describe('getRouteFromSnapshot', () => {
    it('should return an empty string when no snapshot is provided', () => {
      const snapshot: any = null;
      const result = locationTrackingService['getRouteFromSnapshot'](snapshot);
      const expected = '';
      expect(result).toEqual(expected);
    });

    it('should return an empty string if no routeConfig exists', () => {
      const snapshot: any = { value: {} };
      const result = locationTrackingService['getRouteFromSnapshot'](snapshot);
      const expected = '';
      expect(result).toEqual(expected);
    });

    it('should return an empty string if no path exists', () => {
      const snapshot: any = { routeConfig: { value: '' } };
      const result = locationTrackingService['getRouteFromSnapshot'](snapshot);
      const expected = '';
      expect(result).toEqual(expected);
    });

    it('should return a well-formed route when a path exists', () => {
      const result = locationTrackingService['getRouteFromSnapshot'](mockRouter.routerState.root.snapshot);
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
      const result = locationTrackingService['getSnapshotHierarchyAsArray']([snapshot]);
      expect(result).toEqual(expected);
    });

    it('does nothing if there are no children', () => {
      const snapshot: any = {
        outlet: 'one',
        firstChild: null,
      };
      const expected = [snapshot];
      const result = locationTrackingService['getSnapshotHierarchyAsArray']([snapshot]);
      expect(result).toEqual(expected);
    });
  });

  describe('getFormattedQueryString', () => {
    it('should return an empty string if no param map is provided', () => {
      const paramMap: any = null;
      const expected = '';
      const result = locationTrackingService['getFormattedQueryString'](paramMap);
      expect(result).toEqual(expected);
    });

    it('should return the query string when there are params provided', () => {
      const paramMap = convertToParamMap({ licenses: 'approved' });
      const expected = '?licenses=approved';
      const result = locationTrackingService['getFormattedQueryString'](paramMap);
      expect(result).toEqual(expected);
    });
  });
});
