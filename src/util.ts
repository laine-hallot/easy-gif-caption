export const Ok = <T>(data: T): { success: true; data: T } => ({
  success: true,
  data,
});
export const Error = <T extends { message: string; data?: unknown }>(
  error: T,
): { success: false; error: T } => ({
  success: false,
  error,
});

export const isHTMLInput = (
  element: HTMLElement,
): element is HTMLInputElement => {
  return 'value' in element;
};

export const isHTMLButton = (
  element: HTMLElement,
): element is HTMLButtonElement => {
  return element.tagName === 'BUTTON';
};
