import { Result } from './types';
import { isHTMLInput, isHTMLButton } from './util';

const TEXT_INPUT_ID = 'text-input';
const FILE_INPUT_ID = 'file-input';
const SUBMIT_BUTTON_ID = 'submit-button';
const OUTPUT_AREA_ID = 'output';

export const attach = (): Result<
  {
    fileInput: HTMLInputElement;
    textInput: HTMLInputElement;
    submitButton: HTMLButtonElement;
    outputArea: HTMLElement;
  },
  { message: string }
> => {
  const textInput = document.getElementById(TEXT_INPUT_ID);
  const fileInput = document.getElementById(FILE_INPUT_ID);
  const submitButton = document.getElementById(SUBMIT_BUTTON_ID);
  const outputArea = document.getElementById(OUTPUT_AREA_ID);
  if (textInput === null) {
    return { success: false, error: { message: 'Text input not found' } };
  }
  if (fileInput === null) {
    return { success: false, error: { message: 'File input not found' } };
  }
  if (submitButton === null) {
    return { success: false, error: { message: 'Submit button not found' } };
  }
  if (outputArea === null) {
    return { success: false, error: { message: 'Submit button not found' } };
  }
  if (!isHTMLInput(textInput)) {
    return {
      success: false,
      error: { message: `Element: ${TEXT_INPUT_ID} is not an html input` },
    };
  }
  if (!isHTMLInput(fileInput)) {
    return {
      success: false,
      error: { message: `Element: ${FILE_INPUT_ID} is not an html input` },
    };
  }
  if (!isHTMLButton(submitButton)) {
    console.log(submitButton);
    return {
      success: false,
      error: { message: `Element: ${SUBMIT_BUTTON_ID} is not an html button` },
    };
  }

  return {
    success: true,
    data: { fileInput, textInput, submitButton, outputArea },
  };
};
