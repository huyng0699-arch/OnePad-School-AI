import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

type RealArWebViewProps = {
  modelUrl: string;
  title: string;
  description?: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildViewerHtml({ modelUrl, title, description }: RealArWebViewProps) {
  const safeModelUrl = escapeHtml(modelUrl);
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description ?? 'Move your device to place the model in your space.');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <style>
      html, body { margin: 0; height: 100%; background: #020617; color: #e5f2ff; font-family: Arial, sans-serif; }
      model-viewer { width: 100%; height: 100%; background: radial-gradient(circle at 50% 40%, #12345a, #020617 70%); }
      .ar-button { position: absolute; right: 14px; bottom: 14px; border: 0; border-radius: 999px; padding: 12px 14px; background: #e0f2fe; color: #075985; font-weight: 800; box-shadow: 0 16px 34px rgba(8,47,73,.36); }
      .caption { position: absolute; left: 12px; right: 12px; top: 12px; padding: 10px 12px; border-radius: 14px; background: rgba(2,6,23,.72); backdrop-filter: blur(10px); }
      .caption strong { display: block; font-size: 14px; }
      .caption span { display: block; margin-top: 4px; color: #bfdbfe; font-size: 12px; line-height: 1.35; }
      .prompt { position: absolute; left: 50%; bottom: 70px; transform: translateX(-50%); width: min(280px, 80vw); text-align: center; color: #bfdbfe; font-size: 12px; }
    </style>
  </head>
  <body>
    <model-viewer
      src="${safeModelUrl}"
      alt="${safeTitle}"
      ar
      ar-modes="scene-viewer webxr quick-look"
      ar-scale="fixed"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      environment-image="neutral"
      touch-action="pan-y"
      xr-environment>
      <button slot="ar-button" class="ar-button">View in your space</button>
      <div class="caption">
        <strong>${safeTitle}</strong>
        <span>${safeDescription}</span>
      </div>
      <div class="prompt" slot="ar-prompt">Move your device slowly so AR can detect a surface.</div>
    </model-viewer>
  </body>
</html>`;
}

export default function RealArWebView(props: RealArWebViewProps) {
  return (
    <View style={styles.container}>
      <WebView
        source={{ html: buildViewerHtml(props), baseUrl: 'https://modelviewer.dev' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        setSupportMultipleWindows={false}
        onShouldStartLoadWithRequest={(request) => {
          const url = request.url;
          const isExternalAr = url.startsWith('intent://') || url.includes('arvr.google.com/scene-viewer');
          if (isExternalAr) {
            void Linking.openURL(url).catch(() => undefined);
            return false;
          }
          return true;
        }}
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617'
  },
  webView: {
    flex: 1,
    backgroundColor: '#020617'
  }
});
