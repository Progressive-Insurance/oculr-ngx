import { convertToParamMap } from '@angular/router';

import { EventLocation } from '../models/event-location.interface';
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
    };
    expect(insertLocationParams(mockLocation, tokensToReplace, mockParamMap)).toEqual(expected as EventLocation);
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
    };
    expect(insertLocationParams(mockLocation, tokensToReplace, mockParamMap)).toEqual(expected as EventLocation);
  });
});
