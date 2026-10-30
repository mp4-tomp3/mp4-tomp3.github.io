# MP4 to MP3 Converter — 100% Client-Side Offline Audio Extractor

[![Live Demo](https://img.shields.io/badge/Live%20Demo-mp4--tomp3.github.io-4A70A9?style=for-the-badge&logo=googlechrome&logoColor=white)](https://mp4-tomp3.github.io/)
[![Astro](https://img.shields.io/badge/Astro-5.x-BC52EE?style=for-the-badge&logo=astro&logoColor=white)](https://astro.build/)
[![100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Zero--Upload-22c55e?style=for-the-badge&logo=shield&logoColor=white)](https://mp4-tomp3.github.io/)
[![PWA Offline Ready](https://img.shields.io/badge/PWA-100%25%20Offline%20Ready-8FABD4?style=for-the-badge&logo=pwa&logoColor=000000)](https://mp4-tomp3.github.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-EFECE3?style=for-the-badge&logoColor=000000)](LICENSE)
[![Support on Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20the%20Dev-FF5E5B?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/kishara)

> **Free, instantaneous, and strictly private MP4 to MP3 conversion directly in your web browser.** Zero bytes are ever uploaded to any cloud or remote server. Works 100% offline as a Progressive Web App (PWA).

---

## 🔒 Overview & Zero-Server Privacy Architecture

Traditional online audio converters require users to upload sensitive video recordings to unknown cloud servers, where files queue up, consume bandwidth, and risk privacy leaks or data retention.

**MP4 to MP3 Converter** eliminates the server entirely. It operates on a **100% Client-Side Browser Execution Architecture**:

```
[ User Video File (.mp4, .mov, .webm, .mkv) ]
                     │
                     ▼
  [ Browser Memory Sandbox (Blob / ArrayBuffer) ]
                     │
                     ▼
  [ Web Audio API: AudioContext.decodeAudioData ]
   (Decodes multi-channel audio tracks to PCM)
                     │
                     ▼
  [ Audio Processing: Trim & 2s Fade Envelope ]
                     │
                     ▼
  [ WebAssembly / lamejs MP3 Encoder (128-320 kbps) ]
                     │
                     ▼
  [ HTML5 Audio Preview & Instant MP3 File Download ]
  (Zero Server Uploads • Zero Tracking • 100% Private)
```

1. **Sandboxed In-Memory Decoding**: Video containers are read locally using browser `FileReader` and decoded with native `AudioContext.decodeAudioData`.
2. **Sub-Sample Audio Processing**: Custom trim windows and smooth 2-second linear fade-in / fade-out envelopes are applied directly to raw PCM channel buffers.
3. **Optimized LameJS MP3 Encoding**: The audio chunks are encoded to high-fidelity MP3 using `@breezystack/lamejs`, yielding to the browser event loop every 40ms to maintain silky smooth 60 FPS animations.
4. **Complete Data Confidentiality**: Because computation occurs entirely in local RAM and CPU, files of **1GB to 2GB+** can be processed without cloud file caps, subscription paywalls, or privacy compromises.

---

## ✨ Key Features

- **⚡ Instant Local Extraction**: Extract MP3 audio from `.mp4`, `.mov`, `.webm`, `.mkv`, `.avi`, and `.m4v` containers in seconds.
- **🎚️ 3-Tier Bitrate Control**:
  - `128 kbps (Standard)` — Compact file size, ideal for voice recordings and podcasts.
  - `192 kbps (High Quality)` — Crystal-clear audio, balanced for music and videos.
  - `320 kbps (Studio Master)` — Maximum acoustic fidelity with uncompressed high-frequency preservation.
- **✂️ Sample-Accurate Trimming & Fades**: Interactive dual range sliders for start/end trimming plus 2-second smooth Fade In and Fade Out envelopes.
- **📱 PWA Offline "Add to Home Screen"**: Equipped with service worker caching and manifest. Works seamlessly in airplane mode without internet.
- **🌍 8-Language Localization (i18n)**: 100% native translations across English (`/`), Spanish (`/es/`), Portuguese (`/pt/`), German (`/de/`), French (`/fr/`), Japanese (`/ja/`), Chinese (`/zh/`), and Russian (`/ru/`).
- **🌓 Adaptive Theme System**: High-contrast Light Mode and Dark Mode with zero Flash of Unstyled Content (FOUC).
- **📦 Batch Conversion**: Drag-and-drop multiple files simultaneously; download individually or in batch.
- **🎧 In-Browser Audio Player**: Listen to real-time previews before downloading.
- **✨ Instant Synth Demo**: Test conversion instantly with a single click using an in-browser procedurally synthesized melody video.

---

## 🎨 UI/UX Color System

The application uses a distinctive, accessible color palette carefully balanced across light and dark modes:

| Token Name | Hex Code | Light Mode Usage | Dark Mode Usage | Contrast |
| :--- | :--- | :--- | :--- | :--- |
| **Warm Alabaster** | `#EFECE3` | Primary Background & Canvas | Primary Text & High Contrast Elements | AAA Compliant |
| **Soft Sky Steel** | `#8FABD4` | Card Borders, Badges, Waveforms | Secondary Text, Hover Outlines, Icons | AA Compliant |
| **Deep Cobalt Blue** | `#4A70A9` | Primary Action Buttons, Brand Accent | Borders, Focused States, Muted Accents | AAA Compliant |
| **Pure Obsidian Black**| `#000000` | Primary Typography & Button Hovers | Primary Background & Deep Canvas | AAA Compliant |

---

## 🚀 Tech Stack & SEO Highlights

### Core Technologies
- **Framework**: [Astro 5.x](https://astro.build/) (Static Output for GitHub Pages, Zero-JS Footprint by default)
- **CSS Engine**: [Tailwind CSS 3.x](https://tailwindcss.com/) with customized color tokens and smooth equalizer keyframes
- **Audio Decoding**: Web Audio API (`AudioContext`, `OfflineAudioContext`, `decodeAudioData`)
- **MP3 Encoder**: `@breezystack/lamejs` (Fast client-side MP3 encoding engine)
- **Analytics**: Google Analytics 4 (`G-7JNXXYMP21`) with privacy-centric gtag integration
- **Confetti Engine**: `canvas-confetti` celebration micro-interaction

### 100% Technical SEO Architecture
- **Automated Sitemap Generation**: Built with `@astrojs/sitemap` producing `sitemap-index.xml` and `sitemap-0.xml` with complete xhtml hreflang mapping.
- **Crawler Optimization**: `robots.txt` and `.nojekyll` configured for seamless GitHub Pages asset delivery.
- **Full Bidirectional Hreflang Matrix**: Linking all 8 languages plus `x-default` across all views.
- **Strict Safe-Search Schema Markup (JSON-LD)**:
  - `WebApplication` schema (`MultimediaApplication`, `price: '0'`)
  - `BreadcrumbList` schema dynamically structured per language
  - `FAQPage` schema naturally targeting high-intent audio conversion search queries
  - *Strict Policy: Zero fake aggregate ratings or fabricated reviews for 100% Google Rich Snippet compliance.*

---

## 💻 Local Development & Build Instructions

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/mp4-tomp3/mp4-tomp3.github.io.git
cd mp4-tomp3.github.io

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:4321` in your browser.

### Production Build & Preview

```bash
# Build static production bundle into dist/
npm run build

# Preview static output locally
npm run preview
```

---

## 🤖 GitHub Pages Automated Deployment

This repository deploys automatically on every push to the `main` branch via GitHub Actions workflow (`.github/workflows/deploy.yml`):

1. **Checkout**: Checks out repository code.
2. **Build**: Uses `withastro/action@v3` to install dependencies and execute `astro build`.
3. **Deploy**: Employs `actions/deploy-pages@v4` to publish static artifacts to `https://mp4-tomp3.github.io/`.

---

## 💖 Support the Developer

If this open-source, privacy-first audio converter saved your day, please consider supporting ongoing development:

[![Support on Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Kishara-FF5E5B?style=for-the-badge&logo=kofi&logoColor=white)](https://ko-fi.com/kishara)

Your contribution helps maintain zero-ad, client-side open-source utilities for everyone.

---

## 📄 License

This project is open-source and released under the [MIT License](LICENSE).  
Copyright (c) 2026 **Kishara Dilshan / PixelPieStudio**.
