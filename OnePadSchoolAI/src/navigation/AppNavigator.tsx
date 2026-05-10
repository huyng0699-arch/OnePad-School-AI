import React from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import type { HomeRouteTarget } from '../screens/HomeScreen';
import AdvancedScreen from '../screens/AdvancedScreen';
import AiTutorScreen from '../screens/AiTutorScreen';
import ArLabScreen from '../screens/ArLabScreen';
import GroupWorkScreen from '../screens/GroupWorkScreen';
import GuardianReportPreviewScreen from '../screens/GuardianReportPreviewScreen';
import HealthDashboardScreen from '../screens/HealthDashboardScreen';
import LectureRecorderScreen from '../screens/LectureRecorderScreen';
import LessonReaderScreen from '../screens/LessonReaderScreen';
import MovementPlanScreen from '../screens/MovementPlanScreen';
import ProgressScreen from '../screens/ProgressScreen';
import QuizScreen from '../screens/QuizScreen';
import SupportScreen from '../screens/SupportScreen';
import SupportCircleScreen from '../screens/SupportCircleScreen';
import WellbeingCheckInScreen from '../screens/WellbeingCheckInScreen';
import { initializeSyncService } from '../services/sync/studentSyncService';
import { runHandsFreeVoiceCommand } from '../services/handsFreeVoiceOrchestrator';
import { getActiveMockLesson } from '../services/lessons/mockLessonRuntimeStore';
import { lesson } from '../data/mockData';

type AppScreen = 'home' | HomeRouteTarget;

const AppNavigator = () => {
  const [history, setHistory] = React.useState<AppScreen[]>(['home']);
  const [voiceStatus, setVoiceStatus] = React.useState('');
  const tapWindowRef = React.useRef<{ count: number; firstTapAt: number }>({ count: 0, firstTapAt: 0 });
  const isVoiceRunningRef = React.useRef(false);
  const currentScreen = history[history.length - 1] ?? 'home';

  const handleNavigate = (target: HomeRouteTarget) => {
    setHistory((prev) => [...prev, target]);
  };

  const handleBack = () => {
    setHistory((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.slice(0, -1);
    });
  };

  React.useEffect(() => {
    void initializeSyncService();
  }, []);

  React.useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen === 'home') {
        return false;
      }
      handleBack();
      return true;
    });

    return () => subscription.remove();
  }, [currentScreen]);

  const triggerHandsFreeVoice = async () => {
    if (isVoiceRunningRef.current) {
      return;
    }
    isVoiceRunningRef.current = true;
    const activeLesson = getActiveMockLesson(lesson);
    try {
      await runHandsFreeVoiceCommand({
        currentScreen,
        currentLessonTitle: activeLesson.title,
        currentPageNumber: undefined,
        navigate: handleNavigate,
        openStudentHub: () => handleNavigate('lessonReader'),
        openStudentHubSection: (section) => setVoiceStatus(`Open Student Hub first to show ${section}.`),
        setStatus: setVoiceStatus
      });
    } finally {
      isVoiceRunningRef.current = false;
      setTimeout(() => setVoiceStatus(''), 4000);
    }
  };

  const handleTouchStartCapture = (event: { nativeEvent: { touches?: unknown[] } }) => {
    const touches = event.nativeEvent.touches ?? [];
    if (touches.length !== 2) {
      return false;
    }

    const now = Date.now();
    const current = tapWindowRef.current;
    if (now - current.firstTapAt > 1400) {
      tapWindowRef.current = { count: 1, firstTapAt: now };
      return false;
    }

    const nextCount = current.count + 1;
    tapWindowRef.current = { count: nextCount, firstTapAt: current.firstTapAt };
    if (nextCount >= 3) {
      tapWindowRef.current = { count: 0, firstTapAt: 0 };
      void triggerHandsFreeVoice();
    }
    return false;
  };

  const renderScreen = () => {
  switch (currentScreen) {
    case 'home':
      return <HomeScreen onNavigate={handleNavigate} />;
    case 'lessonReader':
      return <LessonReaderScreen onBack={handleBack} onNavigateQuiz={() => handleNavigate('quiz')} />;
    case 'aiTutor':
      return <AiTutorScreen onBack={handleBack} />;
    case 'quiz':
      return <QuizScreen onBack={handleBack} />;
    case 'progress':
      return <ProgressScreen onBack={handleBack} />;
    case 'advanced':
      return <AdvancedScreen onBack={handleBack} />;
    case 'arLab':
      return <ArLabScreen onBack={handleBack} />;
    case 'groupWork':
      return <GroupWorkScreen onBack={handleBack} />;
    case 'lectureRecorder':
      return <LectureRecorderScreen onBack={handleBack} onNavigateQuiz={() => handleNavigate('quiz')} />;
    case 'support':
      return <SupportScreen onBack={handleBack} />;
    case 'healthDashboard':
      return (
        <HealthDashboardScreen
          onBack={handleBack}
          onNavigateMovementPlan={() => handleNavigate('movementPlan')}
          onNavigateWellbeingCheckIn={() => handleNavigate('wellbeingCheckIn')}
          onNavigateGuardianReport={() => handleNavigate('guardianReportPreview')}
        />
      );
    case 'movementPlan':
      return (
        <MovementPlanScreen
          onBack={handleBack}
          onNavigateHealthDashboard={() => handleNavigate('healthDashboard')}
        />
      );
    case 'wellbeingCheckIn':
      return (
        <WellbeingCheckInScreen
          onBack={handleBack}
          onNavigateSupportCircle={() => handleNavigate('supportCircle')}
        />
      );
    case 'supportCircle':
      return (
        <SupportCircleScreen
          onBack={handleBack}
          onNavigateReportPreview={() => handleNavigate('guardianReportPreview')}
        />
      );
    case 'guardianReportPreview':
      return <GuardianReportPreviewScreen onBack={handleBack} />;
    default:
      return <HomeScreen onNavigate={handleNavigate} />;
  }
  };

  return (
    <View style={styles.root} onStartShouldSetResponderCapture={handleTouchStartCapture}>
      {renderScreen()}
      {voiceStatus ? (
        <View pointerEvents="none" style={styles.voiceStatus}>
          <Text style={styles.voiceStatusText}>{voiceStatus}</Text>
          <Text style={styles.voiceStatusHint}>Two fingers x3 opens voice command</Text>
        </View>
      ) : null}
    </View>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  root: { flex: 1 },
  voiceStatus: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 42,
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  voiceStatusText: { color: '#ffffff', fontWeight: '700', fontSize: 13 },
  voiceStatusHint: { color: '#bfdbfe', marginTop: 3, fontSize: 11 }
});
