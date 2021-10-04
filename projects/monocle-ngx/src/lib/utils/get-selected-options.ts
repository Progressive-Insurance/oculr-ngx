export const getSelectedOptions = ($event: any): string => {
  if (!$event || !$event.target || !$event.target.options) {
    return '';
  }
  const selectedOptions = Array.from($event.target.options).filter((option: HTMLOptionElement) => option.selected) as HTMLOptionElement[];
  return selectedOptions.map((option: any) => (option.text || '').replace(/^\s*/, '').replace(/\s*$/, '')).join('&');
};
