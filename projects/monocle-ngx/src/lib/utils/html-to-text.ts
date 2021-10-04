export const htmlToText = (value: any): any => {
  const textarea = document.createElement('div');
  textarea.innerHTML = value;
  return textarea.textContent || textarea.innerText || '';
};
