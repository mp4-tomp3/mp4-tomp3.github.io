import { Mp3Encoder } from '@breezystack/lamejs';

export interface ConversionOptions {
  kbps: 128 | 192 | 320;
  startTime?: number; // seconds
  endTime?: number;   // seconds
  fadeIn?: boolean;   // 2s fade in
  fadeOut?: boolean;  // 2s fade out
  onProgress?: (progress: number, phaseText?: string) => void;
}

export interface ConversionResult {
  blob: Blob;
  url: string;
  duration: number;
  sampleRate: number;
  channels: number;
  kbps: number;
  fileName: string;
}

/**
 * Converts Float32Array PCM (-1.0 to 1.0) to 16-bit signed PCM (Int16Array: -32768 to 32767)
 */
function floatTo16BitPCM(input: Float32Array): Int16Array {
  const len = input.length;
  const output = new Int16Array(len);
  for (let i = 0; i < len; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output;
}

/**
 * Decodes video or audio file locally using Web Audio API
 */
export async function decodeVideoFile(
  file: File | Blob,
  onProgress?: (progress: number, phaseText?: string) => void
): Promise<AudioBuffer> {
  onProgress?.(5, 'statusReading');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.(25, 'statusDecoding');
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  try {
    // Slice ArrayBuffer to avoid detachment issues
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    await audioCtx.close();
    return audioBuffer;
  } catch (err) {
    await audioCtx.close().catch(() => {});
    throw new Error('Could not decode audio from this video container. Ensure the file has an active audio track.');
  }
}

/**
 * Applies optional trim and fade envelope (2s) to PCM channel buffers
 */
export function processAudioEnvelope(
  buffer: AudioBuffer,
  options: ConversionOptions,
  onProgress?: (progress: number, phaseText?: string) => void
): { left: Float32Array; right: Float32Array; duration: number; sampleRate: number } {
  onProgress?.(45, 'statusProcessing');

  const sampleRate = buffer.sampleRate;
  const originalDuration = buffer.duration;
  const totalFrames = buffer.length;

  let startFrame = 0;
  if (options.startTime !== undefined && options.startTime > 0) {
    startFrame = Math.min(Math.floor(options.startTime * sampleRate), totalFrames - 1);
  }

  let endFrame = totalFrames;
  if (options.endTime !== undefined && options.endTime > 0 && options.endTime < originalDuration) {
    endFrame = Math.max(startFrame + 1, Math.min(Math.floor(options.endTime * sampleRate), totalFrames));
  }

  const frameCount = endFrame - startFrame;
  const channels = buffer.numberOfChannels;

  // Extract raw channel data
  const rawLeft = buffer.getChannelData(0).subarray(startFrame, endFrame);
  const rawRight = channels > 1
    ? buffer.getChannelData(1).subarray(startFrame, endFrame)
    : rawLeft;

  const left = new Float32Array(rawLeft);
  const right = channels > 1 ? new Float32Array(rawRight) : left;

  // Apply Smooth Fade In (2s)
  if (options.fadeIn) {
    const fadeFrames = Math.min(Math.floor(2.0 * sampleRate), frameCount);
    for (let i = 0; i < fadeFrames; i++) {
      const gain = i / fadeFrames;
      left[i] *= gain;
      if (channels > 1) right[i] *= gain;
    }
  }

  // Apply Smooth Fade Out (2s)
  if (options.fadeOut) {
    const fadeFrames = Math.min(Math.floor(2.0 * sampleRate), frameCount);
    const startIdx = frameCount - fadeFrames;
    for (let i = 0; i < fadeFrames; i++) {
      const gain = (fadeFrames - 1 - i) / fadeFrames;
      left[startIdx + i] *= gain;
      if (channels > 1) right[startIdx + i] *= gain;
    }
  }

  return {
    left,
    right,
    duration: frameCount / sampleRate,
    sampleRate,
  };
}

/**
 * Encodes processed PCM audio into high-fidelity MP3 using lamejs
 * Yields periodically to the event loop so the UI updates and animations stay 60fps
 */
export async function encodePCMToMP3(
  leftFloat: Float32Array,
  rightFloat: Float32Array,
  sampleRate: number,
  isStereo: boolean,
  options: ConversionOptions
): Promise<Blob> {
  const kbps = options.kbps || 192;
  const channels = isStereo ? 2 : 1;
  const encoder = new Mp3Encoder(channels, sampleRate, kbps);

  const leftPcm = floatTo16BitPCM(leftFloat);
  const rightPcm = isStereo ? floatTo16BitPCM(rightFloat) : leftPcm;

  const sampleBlockSize = 11520; // 10 MP3 frames per chunk
  const totalSamples = leftPcm.length;
  const mp3Data: Uint8Array[] = [];

  let lastYield = performance.now();

  for (let i = 0; i < totalSamples; i += sampleBlockSize) {
    const chunkLeft = leftPcm.subarray(i, i + sampleBlockSize);
    let mp3buf: Int8Array;

    if (isStereo) {
      const chunkRight = rightPcm.subarray(i, i + sampleBlockSize);
      mp3buf = encoder.encodeBuffer(chunkLeft, chunkRight);
    } else {
      mp3buf = encoder.encodeBuffer(chunkLeft);
    }

    if (mp3buf.length > 0) {
      mp3Data.push(new Uint8Array(mp3buf.buffer, mp3buf.byteOffset, mp3buf.length));
    }

    // Report encoding progress from 50% to 95%
    const percent = 50 + Math.floor(((i + sampleBlockSize) / totalSamples) * 45);
    options.onProgress?.(Math.min(96, percent), 'statusEncoding');

    // Yield every 40ms to keep animations silky smooth
    if (performance.now() - lastYield > 40) {
      await new Promise((r) => setTimeout(r, 0));
      lastYield = performance.now();
    }
  }

  // Flush remaining bytes
  const finalBuf = encoder.flush();
  if (finalBuf.length > 0) {
    mp3Data.push(new Uint8Array(finalBuf.buffer, finalBuf.byteOffset, finalBuf.length));
  }

  options.onProgress?.(100, 'statusDone');
  return new Blob(mp3Data, { type: 'audio/mp3' });
}

/**
 * High-level converter function orchestrating extraction, envelope and MP3 encoding
 */
export async function convertVideoToMP3(
  file: File | Blob,
  fileName: string,
  options: ConversionOptions
): Promise<ConversionResult> {
  // 1. Decode container to audio buffer
  const audioBuffer = await decodeVideoFile(file, options.onProgress);

  // 2. Process trimming & fade envelopes
  const isStereo = audioBuffer.numberOfChannels > 1;
  const processed = processAudioEnvelope(audioBuffer, options, options.onProgress);

  // 3. Encode to MP3
  const mp3Blob = await encodePCMToMP3(
    processed.left,
    processed.right,
    processed.sampleRate,
    isStereo,
    options
  );

  const url = URL.createObjectURL(mp3Blob);
  const outBaseName = fileName.replace(/\.[^/.]+$/, '');
  const outFileName = `${outBaseName}.mp3`;

  return {
    blob: mp3Blob,
    url,
    duration: processed.duration,
    sampleRate: processed.sampleRate,
    channels: isStereo ? 2 : 1,
    kbps: options.kbps,
    fileName: outFileName,
  };
}

/**
 * Creates a synthetic demo video (5 seconds) with melody and visualizer
 * 100% in-browser using Web Audio API + Canvas + MediaRecorder
 */
export async function generateDemoVideoBlob(): Promise<File> {
  const durationSec = 4;
  const sampleRate = 44100;

  // Synthesize chord melody in memory
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const offlineCtx = new OfflineAudioContext(2, sampleRate * durationSec, sampleRate);

  // Chord progression: C - G - Am - F
  const chords = [
    [261.63, 329.63, 392.00], // C major
    [196.00, 246.94, 293.66], // G major
    [220.00, 261.63, 329.63], // A minor
    [174.61, 220.00, 261.63], // F major
  ];

  chords.forEach((chord, chordIdx) => {
    const startTime = chordIdx * 1.0;
    chord.forEach((freq) => {
      const osc = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Envelope
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.15, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.95);

      osc.connect(gain);
      gain.connect(offlineCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.98);
    });
  });

  const renderedBuffer = await offlineCtx.startRendering();

  // Create an offscreen canvas
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  // Stream canvas + audio
  const canvasStream = canvas.captureStream(30);
  const audioCtx = new AudioContextClass();
  const source = audioCtx.createBufferSource();
  source.buffer = renderedBuffer;
  const dest = audioCtx.createMediaStreamDestination();
  source.connect(dest);

  dest.stream.getAudioTracks().forEach((track) => canvasStream.addTrack(track));

  // Determine supported mime type
  const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
    ? 'video/webm;codecs=vp9,opus'
    : MediaRecorder.isTypeSupported('video/mp4')
    ? 'video/mp4'
    : 'video/webm';

  const recorder = new MediaRecorder(canvasStream, { mimeType });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordingPromise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: mimeType }));
      audioCtx.close().catch(() => {});
    };
  });

  recorder.start();
  source.start();

  // Animate canvas while recording
  const startT = performance.now();
  const animInterval = setInterval(() => {
    const elapsed = (performance.now() - startT) / 1000;
    if (elapsed > durationSec) {
      clearInterval(animInterval);
      if (recorder.state === 'recording') recorder.stop();
      return;
    }

    // Draw nice animated card
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    grad.addColorStop(0, '#0B1017');
    grad.addColorStop(1, '#4A70A9');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw soundwave bars
    ctx.fillStyle = '#8FABD4';
    const bars = 24;
    const barWidth = 14;
    const spacing = 8;
    const totalW = bars * (barWidth + spacing);
    const startX = (canvas.width - totalW) / 2;

    for (let b = 0; b < bars; b++) {
      const h = Math.abs(Math.sin(elapsed * 5 + b * 0.4)) * 120 + 20;
      const x = startX + b * (barWidth + spacing);
      const y = canvas.height / 2 - h / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, h, 6);
      ctx.fill();
    }

    // Title
    ctx.fillStyle = '#EFECE3';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Demo Video (4s Synth Melody)', canvas.width / 2, 70);
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillStyle = '#8FABD4';
    ctx.fillText('Client-Side Generated • Ready for MP3 Extraction', canvas.width / 2, 98);
  }, 33);

  const videoBlob = await recordingPromise;
  const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
  return new File([videoBlob], `demo-synth-melody.${extension}`, { type: mimeType });
}
