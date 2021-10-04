import { getHostName } from './get-host-name';

describe('getHostName function', () => {
  it('removes the path from a url', () => {
    const url = 'http://www.progressive.com/app/slot1/account-home';
    const path = '/account-home';
    expect(getHostName(url, path)).toBe('http://www.progressive.com/app/slot1');
  });
  it('removes nothing if the path is not in the url', () => {
    const url = 'http://www.progressive.com/app/slot1/account-home';
    const path = '/account-entry';
    expect(getHostName(url, path)).toBe('http://www.progressive.com/app/slot1/account-home');
  });
  it('removes nothing if the path does not start with "/"', () => {
    const url = 'http://www.progressive.com/app/slot1/account-home';
    const path = 'account';
    expect(getHostName(url, path)).toBe('http://www.progressive.com/app/slot1/account-home');
  });
  it('removes the path, and anything after it, from a url', () => {
    const url = 'http://www.progressive.com/app/slot1/account-home?param=value';
    const path = '/account-home';
    expect(getHostName(url, path)).toBe('http://www.progressive.com/app/slot1');
  });
});
