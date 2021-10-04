import { screenResolution } from './screen-resolution';

describe('screenResolution', () => {

  it('should get the screen resolution', () => {
    const windowMock = window as any;
    windowMock.screen = {
      width: 100,
      height: 200
    };
    expect(screenResolution()).toEqual('100x200');
  });

});
