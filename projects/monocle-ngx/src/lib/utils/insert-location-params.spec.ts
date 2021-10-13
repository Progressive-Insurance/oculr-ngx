import { convertToParamMap } from '@angular/router';

import { insertLocationParams } from './insert-location-params';

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
    expect(insertLocationParams(mockLocation, tokensToReplace, mockParamMap)).toEqual(expected as any);
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
    expect(insertLocationParams(mockLocation, tokensToReplace, mockParamMap)).toEqual(expected as any);
  });
});
