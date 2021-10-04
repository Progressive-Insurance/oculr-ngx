export const getHostName = (url: string, path: string) => {
  if (path.charAt(0) !== '/') {
    return url;
  }
  const index = url.indexOf(path);
  if (index === -1) {
    return url;
  }
  return url.slice(0, index);
};
