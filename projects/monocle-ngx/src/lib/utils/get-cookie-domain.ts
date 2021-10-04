/**
 * For google tag manager.
 */
export const getCookieDomain = (hostname: string | undefined) => {
  let tokens: string[];
  if (hostname === 'localhost' || hostname === undefined) {
    return 'none';
  }
  tokens = hostname.split('.');
  if (tokens.length < 3) {
    return '.' + hostname;
  }
  return '.' + tokens[tokens.length - 2] + '.' + tokens[tokens.length - 1];
};
