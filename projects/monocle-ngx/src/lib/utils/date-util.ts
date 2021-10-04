const pad = (num: number, size: number = 2): string => {
  let result: string = num.toString();
  while (result.length < size) {
    result = '0' + result;
  }
  return result;
};

export const formatDateWithTimezoneOffset = (date: Date): string => {
  return date.getFullYear() +
        '-' + pad(date.getMonth() + 1) +
        '-' + pad(date.getDate()) +
        'T' + pad(date.getHours()) +
        ':' + pad(date.getMinutes()) +
        ':' + pad(date.getSeconds()) +
        '.' + pad(date.getMilliseconds(), 3) +
        ((date.getTimezoneOffset() < 0) ? '+' : '-') + pad(Math.floor(Math.abs(date.getTimezoneOffset()) / 60)) +
        ':' + pad(date.getTimezoneOffset() % 60);
};

export const formatCifDate = (date: Date): string => {
  return date.toISOString(); // 2017-10-12T15:20:47.444Z
};
