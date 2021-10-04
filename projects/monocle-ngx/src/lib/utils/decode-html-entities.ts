export const decodeHtmlEntities = (value: any): any => {

  const entitiesToDecode: {[key: string]: string} = {
    '&mdash;': '-'
  };

  Object.keys(entitiesToDecode)
    .forEach((key) => {
      const pattern = new RegExp(key, 'g');
      value = value.replace(pattern, entitiesToDecode[key]);
    });
  return value;
};
