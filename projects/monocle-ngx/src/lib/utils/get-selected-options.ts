export const getSelectedOptions = ($event: Event): string => {
  const options = ($event.target as HTMLSelectElement).options;
  if (!options) {
    return '';
  }
  const selectedOptions = Array.from(options).filter((option: HTMLOptionElement) => option.selected);
  return selectedOptions.map((option: any) => (option.text || '').replace(/^\s*/, '').replace(/\s*$/, '')).join('&');
};
