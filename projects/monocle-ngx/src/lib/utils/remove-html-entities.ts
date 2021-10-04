type matchFunction = (match: string) => string;

export const removeHtmlEntities = (value: any, entitiesToPreserve: string[] = []): any => {
  let replacement: string | matchFunction;

  if (entitiesToPreserve.length) {
    replacement = (match: string) => entitiesToPreserve.indexOf(match) === -1 ? '' : match;
  } else {
    replacement = '';
  }

  // String replace function is interpreting &nbsp; as whitespace when
  // evaluating regular expression matches, causing &nbsp; not to be replaced.
  const pattern = new RegExp('&[^\s]*?;', 'g');
  return value.replace(pattern, replacement);
};
