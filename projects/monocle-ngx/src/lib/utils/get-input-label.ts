export const getInputLabel = ($event: any): string => {
  if (!$event || !$event.target || !$event.target.parentElement || !$event.target.parentElement.textContent) {
    return '';
  }
  return $event.target.parentElement.textContent.replace(/^\s*/, '').replace(/\s*$/, '');
};
