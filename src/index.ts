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
  const videoElm = document.createElement('video');
  videoElm.src = URL.createObjectURL(
    new Blob([fileByteArray], { type: 'video/mp4' }),
  );
  const meta = await new Promise<{
    videoHeight: number;
    videoWidth: number;
    duration: number;
  }>((resolve, reject) => {
    videoElm.onloadedmetadata = (event: Event) => {
      const { target } = event as unknown as { target: HTMLVideoElement };
      console.log(target);
      const { videoHeight, videoWidth, duration } = target;
      resolve({ videoHeight, videoWidth, duration });
    };

    videoElm.load();
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

const transcode = async (text: string) => {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load();
  const fileByteArray = await fetchFile(
    'https://raw.githubusercontent.com/ffmpegwasm/testdata/master/Big_Buck_Bunny_180_10s.webm',
  );
  const meta = await getVideoMeta(fileByteArray);
  console.log(meta);
  await ffmpeg.writeFile('impact.ttf', await fetchFile('/assets/impact.ttf'));
  await ffmpeg.writeFile('input.webm', fileByteArray);
  const textAreaHeight = 60;
  const totalFrameHeight = textAreaHeight + meta.videoHeight;
  const filters = [
    //'drawbox=x=10:y=0:w=200:h=60:color=red@0.5',
    `pad=width=${meta.videoWidth}:height=${totalFrameHeight}:x=0:y=${textAreaHeight}:color=white`,
    `drawtext=fontfile=/impact.ttf:text='${text}':x=(w-text_w)/2:y=10:fontsize=24:fontcolor=black`,
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
    const player = await transcode(textInput.value.toUpperCase());
    outputArea.appendChild(player);
  };
};

start();
