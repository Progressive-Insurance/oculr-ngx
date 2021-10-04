import { getCookieDomain } from './get-cookie-domain';

describe('getCookieDomain', () => {
  it('should return domain as none when hostname is undefined', () => {
    const result = getCookieDomain(undefined);
    expect(result).toBe('none');
  });

  it('should return domain as none when hostname is localhost', () => {
    const result = getCookieDomain('localhost');
    expect(result).toBe('none');
  });

  it('should return domain as .Bob when hostname is Bob', () => {
    const result = getCookieDomain('Bob');
    expect(result).toBe('.Bob');
  });

  it('should return last 2 parts out of hostname as domain', () => {
    const result = getCookieDomain('d1-account.progressive.com');
    expect(result).toBe('.progressive.com');
  });
});
