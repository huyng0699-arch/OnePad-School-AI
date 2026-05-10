# Third Party Notices

## Whisper / whisper.cpp

- Source: https://github.com/ggerganov/whisper.cpp
- React Native binding used by the app: `whisper.rn`
- Runtime model source: `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin`
- License: MIT for whisper.cpp and whisper.rn. Whisper model files are distributed by their upstream model providers.
- Purpose in OnePad: offline Android speech-to-text for voice commands and AI Tutor voice input.

The first Whisper build uses the multilingual `ggml-small.bin` model so English and Vietnamese can share one stronger mobile model. The app downloads this model on demand from the language picker and stores it in the app document directory under `whisper-models/`.
