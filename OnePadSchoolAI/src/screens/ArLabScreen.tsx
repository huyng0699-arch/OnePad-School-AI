import React from 'react';
import { Asset } from 'expo-asset';
import { Linking, NativeModules, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import RealArWebView from '../components/RealArWebView';
import { lesson } from '../data/mockData';
import { generateAiResponse } from '../services/ai/aiClient';
import { buildArExplainPrompt } from '../services/ai/aiPromptBuilder';
import { buildAiContext } from '../services/aiContextBuilder';
import { connectGlassDevice, disconnectGlassDevice, getGlassDeviceState, type GlassDeviceState } from '../services/devices/glassDeviceService';
import { getArModelsFromLesson, getCurrentPage } from '../services/lessonEngine';
import { getBackendBaseUrl } from '../services/sync/syncConfig';
import { studentSyncClient } from '../services/sync/studentSyncClient';
import { studentEventCollector } from '../services/sync/studentEventCollector';

type ArLabScreenProps = {
  onBack: () => void;
};

type ModelReachability = 'idle' | 'checking' | 'ok' | 'failed';

type OnePadArSceneViewerModule = {
  openSceneViewer: (modelUrl: string, title: string) => Promise<boolean>;
  openBundledSceneViewer: (assetPath: string, title: string) => Promise<boolean>;
};

const nativeArSceneViewer = NativeModules.OnePadArSceneViewer as OnePadArSceneViewerModule | undefined;

function isPublicHttpsUrl(value: string) {
  return /^https:\/\//i.test(value);
}

function getBundledAndroidAssetPath(modelUrl: string) {
  if (!modelUrl.startsWith('local://assets/')) {
    return null;
  }

  return modelUrl.replace('local://assets/', '');
}

function buildSceneViewerIntent(modelUrl: string, title: string) {
  const file = encodeURIComponent(modelUrl);
  const safeTitle = encodeURIComponent(title);
  const fallbackUrl = encodeURIComponent(modelUrl);

  return `intent://arvr.google.com/scene-viewer/1.0?file=${file}&mode=ar_preferred&title=${safeTitle}#Intent;scheme=https;package=com.google.ar.core;action=android.intent.action.VIEW;S.browser_fallback_url=${fallbackUrl};end;`;
}

export default function ArLabScreen({ onBack }: ArLabScreenProps) {
  const arModels = getArModelsFromLesson(lesson);
  const [selectedModule, setSelectedModule] = React.useState<number | null>(null);
  const [aiExplanation, setAiExplanation] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const currentModel = selectedModule === null ? null : arModels[selectedModule];
  const backendBase = getBackendBaseUrl().replace(/\/$/, '');
  const [resolvedModelUrl, setResolvedModelUrl] = React.useState<string>('');
  const [isResolvingModel, setIsResolvingModel] = React.useState<boolean>(false);
  const currentContextText = currentModel?.aiText ?? '';
  const canRenderPreview = /^(https?:\/\/|file:\/\/|content:\/\/)/i.test(resolvedModelUrl);
  const currentBundledAndroidAssetPath = currentModel ? getBundledAndroidAssetPath(currentModel.modelUrl) : null;
  const canOpenNativeAr = isPublicHttpsUrl(resolvedModelUrl) || Boolean(currentBundledAndroidAssetPath);
  const [assignedAr, setAssignedAr] = React.useState<Array<{ id: string; title: string }>>([]);
  const [glassState, setGlassState] = React.useState<GlassDeviceState | null>(null);
  const [arRouteStatus, setArRouteStatus] = React.useState<string>('');
  const [showPreview, setShowPreview] = React.useState<boolean>(true);
  const [modelReachability, setModelReachability] = React.useState<ModelReachability>('idle');

  React.useEffect(() => {
    void studentSyncClient.getStudentArAssignments().then((res) => {
      const rows = Array.isArray(res.data) ? res.data : [];
      setAssignedAr(rows.map((item) => ({ id: String(item.id), title: String(item.title ?? item.id) })));
      rows.forEach((item) => void studentEventCollector.recordArAssignmentReceived(String(item.id)));
    });
    void getGlassDeviceState().then(setGlassState);
  }, []);

  React.useEffect(() => {
    let mounted = true;
    const resolveModel = async () => {
      if (!currentModel) {
        if (mounted) {
          setResolvedModelUrl('');
          setIsResolvingModel(false);
        }
        return;
      }
      setIsResolvingModel(true);
      if (/^https?:\/\//i.test(currentModel.modelUrl)) {
        if (mounted) {
          setResolvedModelUrl(currentModel.modelUrl);
          setIsResolvingModel(false);
        }
        return;
      }
      if (currentModel.modelUrl.startsWith('local://assets/models/')) {
        const fileName = currentModel.modelUrl.replace('local://assets/models/', '');
        if (backendBase) {
          if (mounted) {
            setResolvedModelUrl(`${backendBase}/models/${fileName}`);
            setIsResolvingModel(false);
          }
          return;
        }
      }
      if (currentModel.modelUrl === 'local://assets/models/animal-cell-grade8.glb') {
        try {
          const bundledAsset = Asset.fromModule(require('../../assets/models/animal-cell-grade8.glb'));
          await bundledAsset.downloadAsync();
          const localUri = bundledAsset.localUri ?? bundledAsset.uri ?? '';
          if (mounted && localUri) {
            setResolvedModelUrl(localUri);
            setIsResolvingModel(false);
            return;
          }
        } catch {
          // Fallback to backend URL resolution below.
        }
      }
      if (mounted) {
        setResolvedModelUrl('');
        setIsResolvingModel(false);
      }
    };
    void resolveModel();
    return () => {
      mounted = false;
    };
  }, [backendBase, currentModel]);

  React.useEffect(() => {
    let mounted = true;

    const checkModelReachability = async () => {
      if (!resolvedModelUrl || !isPublicHttpsUrl(resolvedModelUrl)) {
        setModelReachability('idle');
        return;
      }

      setModelReachability('checking');
      try {
        const response = await fetch(resolvedModelUrl, { method: 'HEAD' });
        if (mounted) {
          setModelReachability(response.ok ? 'ok' : 'failed');
        }
      } catch {
        if (mounted) {
          setModelReachability('failed');
        }
      }
    };

    void checkModelReachability();
    return () => {
      mounted = false;
    };
  }, [resolvedModelUrl]);

  const toggleGlassConnection = async () => {
    if (glassState?.connected) {
      const next = await disconnectGlassDevice();
      setGlassState(next);
      setArRouteStatus('Google Glass disconnected.');
      return;
    }
    const next = await connectGlassDevice();
    setGlassState(next);
    setArRouteStatus(`Connected to ${next.deviceName}.`);
  };

  const openArCamera = async () => {
    if (!currentModel) {
      setArRouteStatus('Select an AR model first.');
      return;
    }
    setShowPreview(false);

    if (Platform.OS === 'android' && currentBundledAndroidAssetPath && nativeArSceneViewer?.openBundledSceneViewer) {
      try {
        await nativeArSceneViewer.openBundledSceneViewer(currentBundledAndroidAssetPath, currentModel.label);
        setArRouteStatus('Opening the real Android AR camera with the bundled model.');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Google Play Services for AR is missing or this device is not ARCore compatible.';
        setArRouteStatus(`AR camera failed: ${message}`);
      }
      return;
    }

    if (!resolvedModelUrl) {
      setArRouteStatus('AR model URL is unavailable. Please wait for model resolve or configure backend URL.');
      return;
    }

    if (glassState?.connected) {
      const deepLink = `onepadglass://ar/open?model=${encodeURIComponent(resolvedModelUrl)}&title=${encodeURIComponent(currentModel.label)}`;
      const canOpen = await Linking.canOpenURL(deepLink).catch(() => false);
      if (canOpen) {
        await Linking.openURL(deepLink);
        setArRouteStatus(`AR routed to ${glassState.deviceName}.`);
        return;
      } else {
        setArRouteStatus(`Glass is connected but no receiver app found. Using phone AR preview.`);
      }
    }

    if (Platform.OS !== 'android') {
      setShowPreview(true);
      setArRouteStatus('Native AR camera is currently wired for Android Scene Viewer. Showing the 3D preview instead.');
      return;
    }

    if (!canOpenNativeAr) {
      setArRouteStatus(`AR camera needs a public HTTPS .glb URL. Current model source is "${resolvedModelUrl}".`);
      return;
    }

    try {
      if (nativeArSceneViewer?.openSceneViewer) {
        await nativeArSceneViewer.openSceneViewer(resolvedModelUrl, currentModel.label);
      } else {
        await Linking.openURL(buildSceneViewerIntent(resolvedModelUrl, currentModel.label));
      }
      setArRouteStatus('Opening the real Android AR camera with Scene Viewer.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Google Play Services for AR is missing or this device is not ARCore compatible.';
      setArRouteStatus(`AR camera failed: ${message}`);
    }
  };

  const open3dPreview = () => {
    if (!currentModel) {
      setArRouteStatus('Select an AR model first.');
      return;
    }
    if (canRenderPreview) {
      setShowPreview(true);
      setArRouteStatus('Showing the 3D model preview.');
      return;
    }
    setArRouteStatus('Unable to show 3D preview for this model source.');
  };

  const handleExplainModel = async () => {
    if (!currentModel) {
      setAiExplanation('Please select a model first.');
      return;
    }

    setIsLoading(true);
    try {
      const prompt = buildArExplainPrompt(
        currentContextText,
        `Explain model ${currentModel.label}`
      );
      const context = buildAiContext({
        action: 'ar_explain',
        contextMode: 'ar',
        lesson,
        currentPage: getCurrentPage(lesson, currentModel.pageNumber - 1),
        modelMetadata: {
          label: currentModel.label,
          description: currentModel.description
        }
      });
      const response = await generateAiResponse({
        action: 'ar_explain',
        contextMode: 'ar',
        lessonId: lesson.id,
        pageNumber: currentModel.pageNumber,
        prompt,
        contextText: context.contextText,
        metadata: context.metadata
      });
      void studentEventCollector.recordArModelExplained(currentModel.modelUrl);
      setAiExplanation(response.ok ? (response.text ?? 'AI response is empty.') : (response.error ?? 'Unable to explain model.'));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to explain model.';
      setAiExplanation(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AR Lab</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Related Lesson</Text>
        <Text style={styles.body}>{lesson.subject} - {lesson.title}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Assigned AR Lessons</Text>
        {assignedAr.length === 0 ? <Text style={styles.body}>No assigned AR lessons yet.</Text> : assignedAr.map((item) => (
          <Text key={item.id} style={styles.body}>{item.title}</Text>
        ))}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Select AR Model</Text>
        {arModels.length > 0 ? (
          arModels.map((item, index) => (
            <Pressable
              key={item.modelUrl}
              style={styles.actionButton}
              onPress={() => { setSelectedModule(index); setShowPreview(true); setArRouteStatus(''); void studentEventCollector.recordArAssignmentOpened(item.modelUrl); }}
            >
              <Text style={styles.buttonText}>{item.label}</Text>
            </Pressable>
          ))
        ) : (
          <Text style={styles.body}>No AR models found in the current lesson.</Text>
        )}
        <Text style={styles.body}>Selected: {currentModel?.label ?? 'No model selected'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AR Device Routing</Text>
        <Text style={styles.body}>Google Glass: {glassState?.connected ? `Connected (${glassState.deviceName})` : 'Not connected'}</Text>
        <Pressable style={styles.actionButton} onPress={() => void toggleGlassConnection()}>
          <Text style={styles.buttonText}>{glassState?.connected ? 'Disconnect Glass' : 'Connect Glass (Mock)'}</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={open3dPreview}>
          <Text style={styles.buttonText}>View 3D</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.arCameraButton]} onPress={() => void openArCamera()}>
          <Text style={styles.buttonText}>Open AR Camera</Text>
        </Pressable>
        <Text style={styles.readinessText}>AR readiness: {currentBundledAndroidAssetPath ? 'Bundled Android model ready' : canOpenNativeAr ? 'HTTPS model URL ready' : 'Needs bundled model or public HTTPS URL'}</Text>
        <Text style={styles.readinessText}>Model public check: {modelReachability === 'checking' ? 'checking...' : modelReachability === 'ok' ? 'reachable' : modelReachability === 'failed' ? 'failed' : 'not checked'}</Text>
        <Text style={styles.readinessText}>Device route: Android Scene Viewer / ARCore</Text>
        {isResolvingModel ? <Text style={styles.body}>Resolving AR model source...</Text> : null}
        {arRouteStatus ? <Text style={styles.body}>{arRouteStatus}</Text> : null}
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>AR Preview</Text>
        {currentModel && showPreview && canRenderPreview ? (
          <View style={styles.webViewContainer}>
            <RealArWebView modelUrl={resolvedModelUrl} title={currentModel.label} description={currentModel.description} />
          </View>
        ) : currentModel ? (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>AR camera mode: {currentModel.label}</Text>
            <Text style={styles.placeholderText}>Asset: {currentModel.modelUrl}</Text>
            <Text style={styles.placeholderText}>Resolved URL: {resolvedModelUrl || 'not available'}</Text>
          </View>
        ) : (
          <View style={styles.placeholderBox}>
            <Text style={styles.placeholderText}>No AR model selected</Text>
          </View>
        )}
      </View>
      <Pressable
        style={styles.explainButton}
        onPress={() => { void handleExplainModel(); if (currentModel) void studentEventCollector.recordArQuizCompleted(currentModel.modelUrl); }}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Explaining...' : 'Explain Model with AI'}</Text>
      </Pressable>
      {aiExplanation ? <Text style={styles.body}>{aiExplanation}</Text> : null}
      <View style={styles.footer}>
        <Pressable style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Back Home</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: (StatusBar.currentHeight ?? 0) + 8,
    paddingHorizontal: 24,
    paddingBottom: 28,
    backgroundColor: '#ffffff'
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827'
  },
  body: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
    textAlign: 'center'
  },
  card: {
    width: '100%',
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 10,
    marginTop: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8
  },
  actionButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8
  },
  arCameraButton: {
    backgroundColor: '#16a34a'
  },
  readinessText: {
    marginTop: 6,
    fontSize: 13,
    color: '#475569',
    textAlign: 'center'
  },
  webViewContainer: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  placeholderBox: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  placeholderText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '600'
  },
  explainButton: {
    width: '100%',
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  footer: {
    marginTop: 24
  },
  button: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600'
  }
});
