export const getCheckboxState = ($event: any): string => {
  if (!$event || !$event.target) {
    return '';
  }
  return $event.target.checked ? 'Check' : 'Uncheck';
};
