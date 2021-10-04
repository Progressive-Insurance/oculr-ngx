import { windowSize } from './window-size';

describe('windowSize', () => {

  it('should get the window size', () => {
    const windowMock = window as any;
    windowMock.innerWidth = 100;
    windowMock.innerHeight = 200;
    expect(windowSize()).toEqual('100x200');
  });

});
