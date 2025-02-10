import type { Result } from './types';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

import { Ok, Error } from './util';
import { attach } from './attach-dom';

import '../style.css';

const start = () => {
  const attachResult = attach();
  if (!attachResult.success) {
    const body = document.querySelector('body');
    if (body === null) {
      console.error('Dude where tf are your dom element');
      return;
    }
    const errorDiv = document.createElement('div');
    errorDiv.innerText = attachResult.error.message;
    body.appendChild(errorDiv);
    return;
  }
  const { fileInput, textInput, submitButton, outputArea } = attachResult.data;
  const handleClick = clickStuff({ fileInput, textInput, outputArea });
  submitButton.addEventListener('click', async (event) => {
    submitButton.disabled = true;
    try {
      await handleClick(event);
    } catch (error) {
      console.error(error);
    }
    submitButton.disabled = false;
  });
};

const getVideoMeta = async (fileByteArray: Uint8Array) => {
  const videoElm = document.createElement('img');
  videoElm.src = URL.createObjectURL(
    new Blob([fileByteArray], { type: 'image/gif' }),
  );
  const meta = await new Promise<{
    height: number;
    width: number;
  }>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject();
    }, 10000);
    videoElm.onload = (event: Event) => {
      const { target } = event as unknown as { target: HTMLImageElement };
      console.log(target);
      const { naturalHeight, naturalWidth } = target;
      clearTimeout(timeout);
      resolve({ height: naturalHeight, width: naturalWidth });
    };
  });
  /*  // idk if this gets gc'ed properly so just force it to load nothing before we leave this function
  videoElm.src = '';
  await new Promise<{
    videoHeight: number;
    videoWidth: number;
    duration: number;
  }>((resolve, reject) => {
    videoElm.onloadedmetadata = (event: Event) => {};

    videoElm.load();
  }); */

  return meta;
};

const FONT_SIZE = 24;
const LINE_HEIGHT = 1.4;
const TOP_BOTTOM_PADDING = 8;

const calcTextHeight = (text: string): number => {
  const lineBreakCount = text.match(/\n/g)?.length ?? 1;
  console.log({ lineBreakCount });
  const totalHeight = Math.ceil(FONT_SIZE * LINE_HEIGHT * lineBreakCount);
  console.log({ totalHeight });
  return totalHeight;
};

const transcode = async (gifData: File, text: string) => {
  console.log(text);
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();
  const fileByteArray: Uint8Array<ArrayBufferLike> = await fetchFile(gifData);
  console.log(fileByteArray);
  const meta = await getVideoMeta(fileByteArray);
  console.log(meta);
  await ffmpeg.writeFile('impact.ttf', await fetchFile('assets/impact.ttf'));
  await ffmpeg.writeFile('input.webm', fileByteArray);
  const textHeight = calcTextHeight(text);
  const textBoxHeight = textHeight + TOP_BOTTOM_PADDING * 2;
  console.log(textBoxHeight);
  const totalFrameHeight = textBoxHeight + meta.height;
  const filters = [
    //'drawbox=x=10:y=0:w=200:h=60:color=red@0.5',
    `pad=width=${meta.width}:height=${totalFrameHeight}:x=0:y=${textBoxHeight}:color=white`,
    `drawtext=fontfile=/impact.ttf:text='${text}':x=(w-text_w)/2:y=${Math.ceil(textBoxHeight / 2) - Math.ceil(textHeight / 2) + TOP_BOTTOM_PADDING}:fontsize=24:fontcolor=black`,
  ].join(', ');
  console.log(filters);
  await ffmpeg.exec(['-i', 'input.webm', '-vf', filters, 'output.gif']);
  const data = await ffmpeg.readFile('output.gif');
  const player = document.createElement('img');
  player.src = URL.createObjectURL(new Blob([data], { type: 'image/gif' }));
  return player;
};

const clickStuff = ({
  fileInput,
  textInput,
  outputArea,
}: {
  fileInput: HTMLInputElement;
  textInput: HTMLInputElement;
  outputArea: HTMLElement;
}) => {
  return async (event: Event) => {
    outputArea.innerHTML = '';
    console.log(fileInput.files);
    if (fileInput.files !== null) {
      const targetGif = fileInput.files[0];
      const player = await transcode(targetGif, textInput.value.toUpperCase());
      outputArea.appendChild(player);
    }
  };
};

start();
