/*
 * @license
 * Copyright 2021 Progressive Casualty Insurance Company. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT license that can be found in
 * the LICENSE file at https://github.com/Progressive/oculr-ngx/blob/main/LICENSE.md
 */

import { convertToParamMap } from '@angular/router';
import { RouterUtilityService } from './router-utility.service';

describe('RouterUtilityService', () => {
  let service: RouterUtilityService;

  beforeEach(() => {
    service = new RouterUtilityService();
  });

  describe('getSnapshotHierarchyAsArray', () => {
    let snapshot: any;
    it('converts a nested object hierarchy to an array', () => {
      snapshot = {
        outlet: 'one',
        firstChild: {
          outlet: 'child-of-one',
          firstChild: {
            outlet: 'child-of-child-of-one',
          },
        },
      };
      const expected = [snapshot, snapshot.firstChild, snapshot.firstChild.firstChild];
      expect(service.getSnapshotHierarchyAsArray([snapshot])).toEqual(expected);
    });
    it('does nothing if there are no children', () => {
      snapshot = {
        outlet: 'one',
        firstChild: null,
      };
      const expected = [snapshot];
      expect(service.getSnapshotHierarchyAsArray([snapshot])).toEqual(expected);
    });
  });

  describe('insertLocationParams', () => {
    let mockLocation: any;
    let mockParamMap: any;
    beforeEach(() => {
      mockParamMap = convertToParamMap({ token: 'world' }) as any;
    });
    // TODO: more test cases needed for each prop on EventLocation
    it('updates the url with the proper value from paramMap', () => {
      mockLocation = {
        hitId: 1,
        url: '/hello/:token',
      };
      const tokensToReplace = ['token'];
      const expected = {
        hitId: 1,
        url: '/hello/world',
        hostName: '',
        path: '',
        queryString: '',
        virtualPageName: '',
      };
      expect(service.insertLocationParams(mockLocation, tokensToReplace, mockParamMap)).toEqual(expected as any);
    });
    it('ignores tokens not specified', () => {
      mockLocation = {
        hitId: 1,
        url: '/hello/:tokenTwo',
      };
      const tokensToReplace = ['token'];
      const expected = {
        hitId: 1,
        url: '/hello/:tokenTwo',
        hostName: '',
        path: '',
        queryString: '',
        virtualPageName: '',
      };
      expect(service.insertLocationParams(mockLocation, tokensToReplace, mockParamMap)).toEqual(expected as any);
    });
  });

  describe('replaceTokensWithValuesFromParamMap', () => {
    it('replaces only full tokens in the middle and at the end', () => {
      const currentUrl = '/id-card-hub/:policy/:policy';
      const paramMap = convertToParamMap({ policy: 'hello' });
      const replaceParamTokens = ['policy'];
      const expected = '/id-card-hub/hello/hello';
      expect(service.replaceTokensWithValuesFromParamMap(currentUrl, paramMap, replaceParamTokens)).toEqual(expected);
    });
    it('ignores partial matches', () => {
      const currentUrl = '/id-card-hub/:policyNum/:policyNum';
      const paramMap = convertToParamMap({ policy: 'hello' });
      const replaceParamTokens = ['policy'];
      const expected = '/id-card-hub/:policyNum/:policyNum';
      expect(service.replaceTokensWithValuesFromParamMap(currentUrl, paramMap, replaceParamTokens)).toEqual(expected);
    });
    it('inserts params into a url', () => {
      const currentUrl = '/id-card-hub/:policyNumber/:termId/id-card';
      const paramMap = convertToParamMap({ policyNumber: '123456' });
      const replaceParamTokens = ['policyNumber'];
      const expected = '/id-card-hub/123456/:termId/id-card';
      expect(service.replaceTokensWithValuesFromParamMap(currentUrl, paramMap, replaceParamTokens)).toEqual(expected);
    });
    it('returns an undefined url', () => {
      const currentUrl = undefined;
      const paramMap = convertToParamMap({ policyNumber: '123' });
      const replaceParamTokens = ['policyNumber'];
      expect(service.replaceTokensWithValuesFromParamMap(currentUrl, paramMap, replaceParamTokens)).toEqual('');
    });
    it('ignores tokens it is not supposed to replace', () => {
      const currentUrl = '/id-card-hub/:policyNumber/:termId/id-card';
      const paramMap = convertToParamMap({ policyNumber: '12345', termId: '0' });
      const replaceParamTokens: any[] = [];
      const expected = '/id-card-hub/:policyNumber/:termId/id-card';
      expect(service.replaceTokensWithValuesFromParamMap(currentUrl, paramMap, replaceParamTokens)).toEqual(expected);
    });
  });
});
