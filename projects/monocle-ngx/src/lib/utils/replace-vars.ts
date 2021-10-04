export const isValidValue = (value: any) => {
  if (value === undefined || value === null || value === '') {
    return false;
  }
  return true;
};

export const determineValue = (value: any, finalFallback: string | number, fallback?: string | number) => {
  if (isValidValue(value)) {
    return value;
  }
  if (isValidValue(fallback)) {
    return fallback;
  }
  return finalFallback;
};
export const indexReplacer = (match: string, p1: string, value: string | number, fallback?: string | number) => {
  const indexRegex = /.+Index$/g;

  return indexRegex.test(p1) ?
    determineValue(parseInt(String(value), 10) + 1, match, fallback) :
    determineValue(value, match, fallback);
};

export const replaceVars = (template: string, values: Record<string, string | number>, fallback?: string | number) => {
  const variableRegex = /{{\s*(\w+)\s*}}/g;
  return template.replace(variableRegex, (match, p1: string) => {
    return indexReplacer(match, p1, values[p1], fallback);
  });
};
