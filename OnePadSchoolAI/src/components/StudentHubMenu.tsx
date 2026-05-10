import React from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Text,
  View
} from 'react-native';
import type { Assignment, Lesson, Student } from '../types';
import VoiceCommandPanel from './VoiceCommandPanel';
import VoiceEngineSettingsPanel from './VoiceEngineSettingsPanel';
import LanguageLearningSettingsPanel from './LanguageLearningSettingsPanel';
import OnePadBackendSyncPanel from './OnePadBackendSyncPanel';
import {
  attendanceSummary,
  groupAssignments,
  schoolNotices,
  studentAssignments,
  studentGrades,
  studentSchedule,
  weeklyStudy
} from '../data/mockData';
import {
  getAiSettings,
  getAllowedCloudModels,
  getCloudModelLabel,
  getActiveKnowledgeScope,
  getCloudFallbackOnLocalFail,
  isApiKeyConfigured,
  isLocalAiAvailable,
  isWebGroundingAvailable,
  setAiProvider,
  setCloudModel,
  setCloudFallbackOnLocalFail,
  setKnowledgeScope
} from '../services/aiSettingsService';
import type { LocalModelConfig } from '../services/ai/localModelConfig';
import { DEFAULT_LOCAL_MODEL_ID } from '../services/ai/localModelConfig';
import type {
  LocalModelPersistentState,
  LocalModelDownloadStatus
} from '../services/ai/localModelStateStore';
import type { VoiceCommandResult } from '../services/voiceLocalCommandMatcher';

type StudentHubSection =
  | 'home'
  | 'info'
  | 'schedule'
  | 'grades'
  | 'attendance'
  | 'reports'
  | 'charts'
  | 'assignments'
  | 'notices'
  | 'groupWork'
  | 'voiceCommand'
  | 'tools'
  | 'settings'
  | 'support';

type NavigateTarget =
  | 'lessonReader'
  | 'aiTutor'
  | 'quiz'
  | 'progress'
  | 'advanced'
  | 'arLab'
  | 'groupWork'
  | 'lectureRecorder'
  | 'support';

type ProgressInsight = {
  masteryLevel: number;
  strengths: string[];
  weakAreas: string[];
  nextRecommendation: string;
  learningPathState: string;
};

type StudentHubMenuProps = {
  visible: boolean;
  onClose: () => void;
  onNavigate: (target: NavigateTarget) => void;
  student: Student;
  lesson: Lesson;
  assignment: Assignment;
  progressInsight: ProgressInsight;
  initialSection?: StudentHubSection;
  onExecuteVoiceCommand: (command: VoiceCommandResult) => string;
};

export default function StudentHubMenu({
  visible,
  onClose,
  onNavigate,
  student,
  lesson,
  assignment,
  progressInsight,
  initialSection,
  onExecuteVoiceCommand
}: StudentHubMenuProps) {
  const [activeSection, setActiveSection] = React.useState<StudentHubSection>('home');
  const [settingsMessage, setSettingsMessage] = React.useState<string>('');
  const [localAiStatusText, setLocalAiStatusText] = React.useState<string>('Not initialized');
  const [localAiStatus, setLocalAiStatus] = React.useState<
    | 'not_initialized'
    | 'initializing'
    | 'initialized'
    | 'model_source_missing'
    | 'downloading'
    | 'loading'
    | 'ready'
    | 'error'
  >('not_initialized');
  const [localAiLastError, setLocalAiLastError] = React.useState<string | null>(null);
  const [localAiDownloadProgress, setLocalAiDownloadProgress] = React.useState<number | null>(null);
  const [localAiActiveSource, setLocalAiActiveSource] = React.useState<string>('Missing');
  const [localModelConfigs, setLocalModelConfigs] = React.useState<LocalModelConfig[]>([]);
  const [selectedLocalModelId, setSelectedLocalModelIdState] = React.useState<string>(DEFAULT_LOCAL_MODEL_ID);
  const [selectedLocalModelState, setSelectedLocalModelState] = React.useState<LocalModelPersistentState | null>(null);
  const [manualModelUrlDraft, setManualModelUrlDraft] = React.useState<string>('');
  const [manualLocalPathDraft, setManualLocalPathDraft] = React.useState<string>('');
  const [localAiIsInitialized, setLocalAiIsInitialized] = React.useState<boolean>(false);
  const [localAiIsModelLoaded, setLocalAiIsModelLoaded] = React.useState<boolean>(false);
  const [localAiBusyAction, setLocalAiBusyAction] = React.useState<
    null | 'initialize' | 'download' | 'load' | 'test'
  >(null);
  const [localAiOutput, setLocalAiOutput] = React.useState<string>('');
  const [aiSettingsVersion, setAiSettingsVersion] = React.useState<number>(0);
  const aiSettings = getAiSettings();
  const allowedModels = getAllowedCloudModels();
  const knowledgeScope = getActiveKnowledgeScope();
  const cloudFallbackOnLocalFail = getCloudFallbackOnLocalFail();
  const selectedLocalModel = localModelConfigs.find((item) => item.id === selectedLocalModelId) ?? localModelConfigs[0] ?? null;

  React.useEffect(() => {
    if (!visible) {
      setActiveSection('home');
      setSettingsMessage('');
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeSection !== 'home') {
        setActiveSection('home');
        return true;
      }
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [activeSection, visible, onClose]);

  React.useEffect(() => {
    if (visible && initialSection) {
      setActiveSection(initialSection);
    }
  }, [visible, initialSection]);

  const goToTool = (target: NavigateTarget) => {
    onClose();
    onNavigate(target);
  };

  const refreshSettings = () => setAiSettingsVersion((prev) => prev + 1);
  void aiSettingsVersion;

  const loadLocalModels = React.useCallback(async () => {
    try {
      const modelService = await import('../services/ai/localModelRegistryService');
      const stateStore = await import('../services/ai/localModelStateStore');
      const models = await modelService.getLocalModelConfigs();
      setLocalModelConfigs(models);

      const storedSelected = await stateStore.getSelectedLocalModelId();
      const fallbackSelected = models.find((item) => item.id === DEFAULT_LOCAL_MODEL_ID)?.id ?? models[0]?.id ?? DEFAULT_LOCAL_MODEL_ID;
      const selectedId = models.some((item) => item.id === storedSelected) ? (storedSelected as string) : fallbackSelected;
      setSelectedLocalModelIdState(selectedId);
      await stateStore.setSelectedLocalModelId(selectedId);

      const selectedCfg = models.find((item) => item.id === selectedId);
      if (selectedCfg) {
        const persisted = await stateStore.getModelState(selectedCfg.id, selectedCfg.quantization);
        setSelectedLocalModelState(persisted);
      } else {
        setSelectedLocalModelState(null);
      }
    } catch {
      setLocalModelConfigs([]);
      setSelectedLocalModelState(null);
    }
  }, []);

  const refreshSelectedModelState = React.useCallback(async (model: LocalModelConfig | null) => {
    if (!model) {
      setSelectedLocalModelState(null);
      return;
    }
    const stateStore = await import('../services/ai/localModelStateStore');
    const persisted = await stateStore.getModelState(model.id, model.quantization);
    setSelectedLocalModelState(persisted);
  }, []);

  React.useEffect(() => {
    if (!visible) return;
    void loadLocalModels();
  }, [visible, loadLocalModels]);

  const updateLocalStatusFromRuntime = async () => {
    try {
      const mod = await import('../services/ai/providers/cactusLocalProvider');
      const status = mod.getCactusStatus();
      const labelMap: Record<string, string> = {
        not_initialized: 'Not initialized',
        initializing: 'Initializing Cactus...',
        initialized: 'Cactus initialized',
        model_source_missing: 'Model source missing',
        downloading: 'Downloading selected model...',
        loading: 'Loading selected model...',
        ready: 'Ready',
        error: 'Error'
      };
      const label = labelMap[status.status] ?? status.status;
      const suffix = status.downloadProgress != null && status.status === 'downloading'
        ? ` (${Math.round(status.downloadProgress * 100)}%)`
        : '';
      const errorSuffix = status.lastError ? `: ${status.lastError}` : '';
      setLocalAiStatusText(`${label}${suffix}${errorSuffix}`);
      setLocalAiStatus(status.status);
      setLocalAiLastError(status.lastError);
      setLocalAiDownloadProgress(status.downloadProgress);
      setLocalAiIsInitialized(Boolean(status.isInitialized));
      setLocalAiIsModelLoaded(Boolean(status.isModelLoaded));
      const sourceType = status.activeSourceType ?? 'missing';
      const sourceValue = status.activeSourceValue ?? '';
      const prettySource = sourceType === 'local_path'
        ? `Manual Local Path: ${sourceValue}`
        : sourceType === 'cactus_registry'
          ? `Cactus Registry: ${sourceValue}`
          : sourceType === 'manual_url'
            ? `Manual URL: ${sourceValue}`
              : 'Missing';
      setLocalAiActiveSource(prettySource);
    } catch {
      setLocalAiStatusText('Error: failed to read Cactus status.');
      setLocalAiStatus('error');
      setLocalAiLastError('Failed to read Cactus status.');
      setLocalAiDownloadProgress(null);
      setLocalAiActiveSource('Error');
    }
  };

  const renderHome = () => {
    const cards: Array<{ id: StudentHubSection; title: string; subtitle: string }> = [
      { id: 'info', title: 'Student Information', subtitle: 'Profile and current learning identity' },
      { id: 'schedule', title: "Today's Schedule", subtitle: 'Class timeline and current period' },
      { id: 'grades', title: 'Grades & Scores', subtitle: 'Recent performance and mastery' },
      { id: 'attendance', title: 'Attendance', subtitle: 'Monthly attendance summary' },
      { id: 'assignments', title: 'Assignments', subtitle: 'Due tasks and current status' },
      { id: 'reports', title: 'Learning Reports', subtitle: 'Progress insight and recommendations' },
      { id: 'charts', title: 'Progress Charts', subtitle: 'Visual learning trends' },
      { id: 'notices', title: 'School Notices', subtitle: 'Latest school announcements' },
      { id: 'groupWork', title: 'Group Work', subtitle: 'Team assignments and discussion' },
      { id: 'voiceCommand', title: 'Voice Command', subtitle: 'Control the app with spoken commands' },
      { id: 'tools', title: 'Learning Tools', subtitle: 'Open learning tools and practice apps' },
      { id: 'settings', title: 'AI & App Settings', subtitle: 'Cloud model and AI mode settings' },
      { id: 'support', title: 'Support', subtitle: 'Get help and student-safe support' }
    ];

    return (
      <View style={styles.grid}>
        {cards.map((card) => (
          <Pressable key={card.id} style={styles.card} onPress={() => setActiveSection(card.id)}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
          </Pressable>
        ))}
      </View>
    );
  };

  const renderInfo = () => (
    <View style={styles.sectionWrap}>
      <Text style={styles.item}>Full name: {student.name}</Text>
      <Text style={styles.item}>Student ID: {student.studentCode ?? 'OPS-8A-001'}</Text>
      <Text style={styles.item}>Grade: {student.grade}</Text>
      <Text style={styles.item}>Class: {student.className ?? '8A'}</Text>
      <Text style={styles.item}>School: {student.schoolName ?? 'OnePad Demo School'}</Text>
      <Text style={styles.item}>Homeroom teacher: {student.homeroomTeacher ?? 'Demo Teacher'}</Text>
      <Text style={styles.item}>Current subject: {lesson.subject}</Text>
      <Text style={styles.item}>Current lesson: {lesson.title}</Text>
      <Text style={styles.item}>Portal status: Active</Text>
      <Text style={styles.item}>Learning mode: Student App Demo</Text>
    </View>
  );

  const renderSchedule = () => (
    <View style={styles.sectionWrap}>
      {studentSchedule.map((item) => (
        <View key={item.id} style={[styles.rowCard, item.status === 'Current' ? styles.highlightCard : null]}>
          <Text style={styles.itemStrong}>{item.time} Ã¢â‚¬Â¢ {item.subject}</Text>
          <Text style={styles.item}>Room: {item.room} Ã¢â‚¬Â¢ Teacher: {item.teacher}</Text>
          <Text style={styles.badge}>{item.status}</Text>
        </View>
      ))}
      <Pressable style={styles.primaryBtn} onPress={() => goToTool('lessonReader')}>
        <Text style={styles.primaryBtnText}>Open Current Lesson</Text>
      </Pressable>
    </View>
  );

  const renderGrades = () => (
    <View style={styles.sectionWrap}>
      {studentGrades.map((item) => (
        <View key={item.subject} style={styles.rowCard}>
          <Text style={styles.itemStrong}>{item.subject} Ã¢â‚¬Â¢ Score {item.recentScore}</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${item.mastery}%` }]} />
          </View>
          <Text style={styles.item}>Mastery: {item.mastery}% Ã¢â‚¬Â¢ {item.trend}</Text>
          <Text style={styles.item}>{item.note}</Text>
        </View>
      ))}
    </View>
  );

  const renderAttendance = () => {
    const totalDays = attendanceSummary.presentDays + attendanceSummary.absentDays + attendanceSummary.lateDays;
    const rate = totalDays > 0 ? Math.round((attendanceSummary.presentDays / totalDays) * 100) : 0;
    return (
      <View style={styles.sectionWrap}>
        <Text style={styles.item}>Month: {attendanceSummary.currentMonth}</Text>
        <Text style={styles.item}>Present: {attendanceSummary.presentDays}</Text>
        <Text style={styles.item}>Absent: {attendanceSummary.absentDays}</Text>
        <Text style={styles.item}>Late: {attendanceSummary.lateDays}</Text>
        <Text style={styles.item}>Attendance rate: {rate}%</Text>
        <Text style={styles.item}>Recent note: You were late on Monday.</Text>
      </View>
    );
  };

  const renderAssignments = () => (
    <View style={styles.sectionWrap}>
      <View style={styles.rowCard}>
        <Text style={styles.itemStrong}>{assignment.title}</Text>
        <Text style={styles.item}>Due: {assignment.dueDate} Ã¢â‚¬Â¢ Status: {assignment.completed ? 'Completed' : 'In progress'}</Text>
      </View>
      {studentAssignments.map((item) => (
        <View key={item.id} style={styles.rowCard}>
          <Text style={styles.itemStrong}>{item.title}</Text>
          <Text style={styles.item}>{item.subject} Ã¢â‚¬Â¢ Due: {item.dueDate}</Text>
          <Text style={styles.badge}>{item.status}</Text>
        </View>
      ))}
      <Pressable style={styles.primaryBtn} onPress={() => goToTool('quiz')}>
        <Text style={styles.primaryBtnText}>Open Practice Quiz</Text>
      </Pressable>
    </View>
  );

  const renderReports = () => (
    <View style={styles.sectionWrap}>
      <Text style={styles.itemStrong}>Current mastery: {progressInsight.masteryLevel}%</Text>
      <Text style={styles.item}>Strengths: {progressInsight.strengths.join(', ')}</Text>
      <Text style={styles.item}>Weak areas: {progressInsight.weakAreas.join(', ')}</Text>
      <Text style={styles.item}>Learning path: {progressInsight.learningPathState}</Text>
      <Text style={styles.item}>Recommended next step: {progressInsight.nextRecommendation}</Text>
      <Text style={styles.item}>Last quiz result: Local progress engine tracking</Text>
      <Text style={styles.item}>AI recommendation: Available in AI tools when requested</Text>
    </View>
  );

  const renderCharts = () => (
    <View style={styles.sectionWrap}>
      {studentGrades.map((item) => (
        <View key={item.subject} style={styles.rowCard}>
          <Text style={styles.itemStrong}>{item.subject} mastery</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${item.mastery}%` }]} />
          </View>
        </View>
      ))}
      {weeklyStudy.map((item) => (
        <View key={item.day} style={styles.rowCard}>
          <Text style={styles.item}>{item.day}: {item.minutes} min</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFillAlt, { width: `${Math.min(100, item.minutes * 2)}%` }]} />
          </View>
        </View>
      ))}
      <Text style={styles.item}>Quiz accuracy: 78% (placeholder)</Text>
    </View>
  );

  const renderNotices = () => (
    <View style={styles.sectionWrap}>
      {schoolNotices.map((item) => (
        <View key={item.id} style={styles.rowCard}>
          <Text style={styles.itemStrong}>{item.title}</Text>
          <Text style={styles.badge}>{item.date}</Text>
          <Text style={styles.item}>{item.message}</Text>
        </View>
      ))}
    </View>
  );

  const renderTools = () => (
    <View style={styles.sectionWrap}>
      {[
        { title: 'AI Tutor', subtitle: 'General AI tutor chat', target: 'aiTutor' as const },
        { title: 'Quiz', subtitle: 'Practice and local grading', target: 'quiz' as const },
        { title: 'Progress', subtitle: 'Mastery and recommendations', target: 'progress' as const },
        { title: 'AR Lab', subtitle: '3D learning preview', target: 'arLab' as const },
        { title: 'Group Work', subtitle: 'Team assignments and discussion', target: 'groupWork' as const },
        { title: 'Advanced Challenge', subtitle: 'Stretch learning tasks', target: 'advanced' as const },
        { title: 'Lecture Recorder', subtitle: 'Transcript demo tools', target: 'lectureRecorder' as const },
        { title: 'Support', subtitle: 'Student-safe support', target: 'support' as const }
      ].map((tool) => (
        <View key={tool.title} style={styles.rowCard}>
          <Text style={styles.itemStrong}>{tool.title}</Text>
          <Text style={styles.item}>{tool.subtitle}</Text>
          <Pressable style={styles.primaryBtn} onPress={() => goToTool(tool.target)}>
            <Text style={styles.primaryBtnText}>Open</Text>
          </Pressable>
        </View>
      ))}
      <Pressable style={styles.secondaryBtn} onPress={() => setActiveSection('home')}>
        <Text style={styles.secondaryBtnText}>Back to Student Hub</Text>
      </Pressable>
    </View>
  );

  const renderGroupWork = () => {
    const activeGroup = groupAssignments.find((item) => item.status !== 'submitted') ?? groupAssignments[0];
    const doneCount = activeGroup.tasks.filter((item) => item.status === 'done').length;
    return (
      <View style={styles.sectionWrap}>
        <View style={styles.rowCard}>
          <Text style={styles.itemStrong}>{activeGroup.title}</Text>
          <Text style={styles.item}>Group: {activeGroup.groupName}</Text>
          <Text style={styles.item}>Due: {activeGroup.dueDate}</Text>
          <Text style={styles.item}>Status: {activeGroup.status}</Text>
          <Text style={styles.item}>Task progress: {doneCount}/{activeGroup.tasks.length}</Text>
          <Pressable style={styles.primaryBtn} onPress={() => goToTool('groupWork')}>
            <Text style={styles.primaryBtnText}>Open Group Work</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const localModelStatus = (selectedLocalModelState?.status ?? 'not_started') as LocalModelDownloadStatus;
  const localModelReady = localModelStatus === 'ready' && localAiStatus === 'ready' && localAiIsModelLoaded;
  const localModelActionLabel =
    localAiBusyAction === 'download' || localAiStatus === 'downloading'
      ? `Downloading... ${Math.round((localAiDownloadProgress ?? 0) * 100)}%`
      : localAiBusyAction === 'load' || localAiStatus === 'loading'
        ? 'Loading downloaded model...'
      : localModelStatus === 'downloading' ? 'Downloading...'
      : localModelStatus === 'paused' ? 'Resume Download'
        : localModelStatus === 'failed' ? 'Retry Download'
          : localModelStatus === 'downloaded' ? 'Load Downloaded Model'
            : localModelReady ? `${selectedLocalModel?.label ?? 'Selected model'} Loaded ✓`
              : 'Start Download';

  const renderSettings = () => (
    <View style={styles.sectionWrap}>
      <View style={styles.rowCard}>
        <Text style={styles.itemStrong}>Voice Command</Text>
        <Text style={styles.item}>Current engine and test status are shown below.</Text>
        <VoiceCommandPanel
          currentScreen="home"
          currentLessonTitle={lesson.title}
          currentPageNumber={1}
          onExecute={(command) => {
            const message = onExecuteVoiceCommand(command);
            setSettingsMessage(message);
          }}
        />
      </View>

      <VoiceEngineSettingsPanel />
      <LanguageLearningSettingsPanel />

      <Text style={styles.itemStrong}>AI Mode</Text>
      <Pressable
        style={[styles.rowCard, aiSettings.provider === 'gemini' ? styles.highlightCard : null]}
        onPress={() => {
          const result = setAiProvider('gemini');
          setSettingsMessage(result.message);
          refreshSettings();
        }}
      >
        <Text style={styles.itemStrong}>Cloud AI</Text>
        <Text style={styles.item}>Uses Gemini cloud AI for demo responses.</Text>
      </Pressable>
      <Pressable
        style={[styles.rowCard, (aiSettings.provider === 'cactus' || aiSettings.provider === 'local_ai') ? styles.highlightCard : null]}
        onPress={() => {
          const result = setAiProvider('cactus');
          setSettingsMessage(result.message);
          refreshSettings();
        }}
      >
        <Text style={styles.itemStrong}>Local AI</Text>
        <Text style={styles.item}>Runtime: Cactus. Model: Gemma 4 E2B Local via Cactus.</Text>
      </Pressable>

      {aiSettings.provider === 'gemini' ? (
        <View style={styles.rowCard}>
          <Text style={styles.itemStrong}>Current Model</Text>
          {allowedModels.map((model) => (
            <Pressable
              key={model}
              style={[styles.modelBtn, aiSettings.cloudModel === model ? styles.modelBtnActive : null]}
              onPress={() => {
                const result = setCloudModel(model);
                setSettingsMessage(result.message);
                refreshSettings();
              }}
            >
              <Text style={styles.modelText}>{getCloudModelLabel(model)}</Text>
              <Text style={styles.modelSubText}>{model}</Text>
            </Pressable>
          ))}
          <Text style={styles.item}>Model availability and daily limits depend on Google AI Studio.</Text>
        </View>
      ) : null}

      {aiSettings.provider === 'cactus' || aiSettings.provider === 'local_ai' ? (
        <View style={styles.rowCard}>
          <Text style={styles.itemStrong}>Local AI (Cactus)</Text>
          <Text style={styles.item}>Selected model: {selectedLocalModel?.label ?? '(none)'}</Text>
          <Text style={styles.item}>Model id: {selectedLocalModel?.registryKey ?? '(none)'}</Text>
          <Text style={styles.item}>Status: {localAiStatusText}</Text>
          <Text style={styles.item}>Model state: {localModelStatus}</Text>
          <Text style={styles.item}>Active source: {localAiActiveSource}</Text>
          <Text style={styles.item}>Cloud fallback when Local AI fails: {cloudFallbackOnLocalFail ? 'On' : 'Off'}</Text>

          <Pressable
            style={[styles.modelBtn, cloudFallbackOnLocalFail ? styles.modelBtnActive : null]}
            onPress={() => {
              const result = setCloudFallbackOnLocalFail(true);
              setSettingsMessage(result.message);
              refreshSettings();
            }}
          >
            <Text style={styles.modelText}>Cloud fallback: On</Text>
            <Text style={styles.modelSubText}>If Local AI fails, use Gemini and show a notice.</Text>
          </Pressable>
          <Pressable
            style={[styles.modelBtn, !cloudFallbackOnLocalFail ? styles.modelBtnActive : null]}
            onPress={() => {
              const result = setCloudFallbackOnLocalFail(false);
              setSettingsMessage(result.message);
              refreshSettings();
            }}
          >
            <Text style={styles.modelText}>Cloud fallback: Off</Text>
            <Text style={styles.modelSubText}>If Local AI fails, show the Local AI error.</Text>
          </Pressable>

          <Text style={styles.itemStrong}>Local Model</Text>
          {localModelConfigs.map((model) => (
            <Pressable
              key={model.id}
              disabled={!model.enabled}
              style={[
                styles.modelBtn,
                selectedLocalModelId === model.id ? styles.modelBtnActive : null,
                !model.enabled ? styles.primaryBtnDisabled : null
              ]}
              onPress={async () => {
                const stateStore = await import('../services/ai/localModelStateStore');
                setSelectedLocalModelIdState(model.id);
                await stateStore.setSelectedLocalModelId(model.id);
                await refreshSelectedModelState(model);
                setSettingsMessage(`Selected local model: ${model.label}`);
              }}
            >
              <Text style={styles.modelText}>
                {model.label}
                {model.recommended ? ' (Recommended)' : ''}
                {model.advanced ? ' (Advanced)' : ''}
              </Text>
              <Text style={styles.modelSubText}>Quantization: {model.quantization}</Text>
              {!model.enabled && model.unavailableReason ? (
                <Text style={styles.modelSubText}>Not available in current Cactus registry.</Text>
              ) : null}
            </Pressable>
          ))}

          <Pressable
            disabled={localAiBusyAction != null || localAiStatus === 'initializing'}
            style={({ pressed }) => [
              styles.primaryBtn,
              (localAiBusyAction != null || localAiStatus === 'initializing') ? styles.primaryBtnDisabled : null,
              pressed && (localAiBusyAction == null && localAiStatus !== 'initializing') ? styles.primaryBtnPressed : null
            ]}
            onPress={async () => {
              if (!selectedLocalModel) {
                setSettingsMessage('No local model selected.');
                return;
              }
              setLocalAiBusyAction('initialize');
              setSettingsMessage('');
              try {
                const mod = await import('../services/ai/providers/cactusLocalProvider');
                const result = await mod.initializeCactus(selectedLocalModel);
                setSettingsMessage(result.ok ? 'Cactus Initialized ✓' : `Init failed: ${result.error}`);
              } finally {
                setLocalAiBusyAction(null);
                await updateLocalStatusFromRuntime();
                await refreshSelectedModelState(selectedLocalModel);
              }
            }}
          >
            <View style={styles.primaryBtnContent}>
              {localAiBusyAction === 'initialize' ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : null}
              <Text style={styles.primaryBtnText}>
                {localAiIsInitialized && localAiStatus !== 'not_initialized'
                  ? 'Cactus Initialized ✓'
                  : (localAiBusyAction === 'initialize' ? 'Initializing...' : 'Initialize Cactus')}
              </Text>
            </View>
          </Pressable>
          <Pressable
            disabled={
              !localAiIsInitialized ||
              !selectedLocalModel ||
              !selectedLocalModel.enabled ||
              localAiBusyAction != null ||
              localAiStatus === 'downloading' ||
              localAiStatus === 'loading'
            }
            style={({ pressed }) => [
              styles.primaryBtn,
              (
                !localAiIsInitialized ||
                !selectedLocalModel ||
                !selectedLocalModel.enabled ||
                localAiBusyAction != null ||
                localAiStatus === 'downloading' ||
                localAiStatus === 'loading'
              )
                ? styles.primaryBtnDisabled
                : null,
              pressed && (localAiIsInitialized && localAiBusyAction == null && localAiStatus !== 'downloading' && localAiStatus !== 'loading')
                ? styles.primaryBtnPressed
                : null
            ]}
            onPress={async () => {
              if (!selectedLocalModel) {
                setSettingsMessage('No local model selected.');
                return;
              }
              if (!selectedLocalModel.enabled) {
                setSettingsMessage(selectedLocalModel.unavailableReason ?? 'Selected model is unavailable.');
                return;
              }
              setSettingsMessage('');
              const mod = await import('../services/ai/providers/cactusLocalProvider');
              setLocalAiBusyAction('download');
              const progressTimer = setInterval(() => {
                void updateLocalStatusFromRuntime();
              }, 500);
              if (localModelStatus === 'paused') {
                setSettingsMessage('Resume Download will restart because Cactus download API does not support true resume.');
              }
              const dl = await mod.downloadSelectedLocalModel(selectedLocalModel);
              clearInterval(progressTimer);
              await updateLocalStatusFromRuntime();
              if (!dl.ok) {
                setSettingsMessage(dl.error);
                setLocalAiBusyAction(null);
                return;
              }

              setLocalAiBusyAction('load');
              const load = await mod.loadSelectedLocalModel(selectedLocalModel);
              setSettingsMessage(load.ok ? `${selectedLocalModel.label} Loaded ✓` : load.error);
              setLocalAiBusyAction(null);
              await updateLocalStatusFromRuntime();
              await refreshSelectedModelState(selectedLocalModel);
            }}
          >
            <View style={styles.primaryBtnContent}>
              {localAiBusyAction === 'download' || localAiBusyAction === 'load' ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : null}
              <Text style={styles.primaryBtnText}>{localModelActionLabel}</Text>
            </View>
          </Pressable>
          {(localAiBusyAction === 'download' || localAiStatus === 'downloading') ? (
            <View style={styles.localAiProgressBlock}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.round(Math.max(0, Math.min(1, localAiDownloadProgress ?? 0)) * 100)}%` }
                  ]}
                />
              </View>
              <Text style={styles.itemSubtle}>
                Download progress: {Math.round((localAiDownloadProgress ?? 0) * 100)}%
              </Text>
            </View>
          ) : null}

          <Pressable
            disabled={!localModelReady || localAiBusyAction != null || !selectedLocalModel}
            style={({ pressed }) => [
              styles.primaryBtn,
              (!localModelReady || localAiBusyAction != null || !selectedLocalModel) ? styles.primaryBtnDisabled : null,
              pressed && (localModelReady && localAiBusyAction == null) ? styles.primaryBtnPressed : null
            ]}
            onPress={async () => {
              if (!selectedLocalModel) {
                setSettingsMessage('No local model selected.');
                return;
              }
              setLocalAiOutput('');
              setSettingsMessage('');
              setLocalAiBusyAction('test');
              const mod = await import('../services/ai/providers/cactusLocalProvider');
              const local = await mod.generateWithCactus({
                action: 'chat',
                contextMode: 'general',
                prompt: 'Explain cells in one sentence.',
                contextText: 'local_test'
              }, selectedLocalModel);

              if (local.ok) {
                setLocalAiOutput(local.text);
                setSettingsMessage('Local AI test ok.');
                setLocalAiBusyAction(null);
                await updateLocalStatusFromRuntime();
                return;
              }

              if (!cloudFallbackOnLocalFail) {
                setSettingsMessage(local.error);
                setLocalAiBusyAction(null);
                await updateLocalStatusFromRuntime();
                return;
              }

              const { geminiCloudProvider } = await import('../services/ai/providers/geminiCloudProvider');
              const cloud = await geminiCloudProvider.generate({
                action: 'chat',
                contextMode: 'general',
                prompt: 'Explain cells in one sentence.',
                contextText: 'local_test'
              });

              if (cloud.ok) {
                setLocalAiOutput(`Cloud fallback used because Local AI failed.\n\n${cloud.text}`);
                setSettingsMessage(`Local AI failed: ${local.error}`);
              } else {
                setSettingsMessage(`Local AI failed: ${local.error}. Cloud fallback also failed: ${cloud.error}`);
              }

              setLocalAiBusyAction(null);
              await updateLocalStatusFromRuntime();
            }}
          >
            <View style={styles.primaryBtnContent}>
              {localAiBusyAction === 'test' ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : null}
              <Text style={styles.primaryBtnText}>
                {localAiBusyAction === 'test' ? 'Running local test...' : 'Run Local Test Prompt'}
              </Text>
            </View>
          </Pressable>

          {!localModelReady ? (
            <Text style={styles.itemSubtle}>Load the selected local model first.</Text>
          ) : null}

          {localAiLastError ? (
            <View style={localAiStatus === 'model_source_missing' ? styles.warnCard : styles.errorCard}>
              <Text style={styles.item}>
                {localAiLastError}
              </Text>
            </View>
          ) : null}

          <View style={styles.advancedCard}>
            <Text style={styles.itemStrong}>Advanced Model Source</Text>
            <Text style={styles.item}>Default registry id: {selectedLocalModel?.registryKey ?? '(none)'}</Text>
            <Text style={styles.item}>
              Default URL configured: No
            </Text>

            <Text style={styles.itemSubtle}>Manual model URL</Text>
            <TextInput
              value={manualModelUrlDraft}
              onChangeText={setManualModelUrlDraft}
              placeholder="https://... (not supported by CactusLM download)"
              placeholderTextColor="#94a3b8"
              style={styles.textInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.itemSubtle}>Manual local path</Text>
            <TextInput
              value={manualLocalPathDraft}
              onChangeText={setManualLocalPathDraft}
              placeholder="/data/user/0/... or file://..."
              placeholderTextColor="#94a3b8"
              style={styles.textInput}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.advancedRow}>
              <Pressable
                style={({ pressed }) => [styles.secondaryBtnSmall, pressed ? styles.secondaryBtnSmallPressed : null]}
                onPress={async () => {
                  const svc = await import('../services/ai/localAiSourceService');
                  svc.setManualLocalAiSource({
                    remoteUrl: manualModelUrlDraft.trim(),
                    localPath: manualLocalPathDraft.trim()
                  });
                  setSettingsMessage('Manual source saved.');
                  await updateLocalStatusFromRuntime();
                }}
              >
                <Text style={styles.secondaryBtnText}>Save Manual Source</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.secondaryBtnSmall, pressed ? styles.secondaryBtnSmallPressed : null]}
                onPress={async () => {
                  const svc = await import('../services/ai/localAiSourceService');
                  svc.clearManualLocalAiSource();
                  setManualModelUrlDraft('');
                  setManualLocalPathDraft('');
                  setSettingsMessage('Manual source cleared.');
                  await updateLocalStatusFromRuntime();
                }}
              >
                <Text style={styles.secondaryBtnText}>Clear Manual Source</Text>
              </Pressable>
            </View>

            <Pressable
              style={({ pressed }) => [styles.secondaryBtnSmall, pressed ? styles.secondaryBtnSmallPressed : null]}
              onPress={async () => {
                const resolver = await import('../services/ai/modelSourceResolver');
                const resolved = resolver.resolveLocalModelSource(selectedLocalModel);
                if (!resolved.ok) {
                  setSettingsMessage(resolved.error ?? 'Model source missing.');
                } else {
                  const msg =
                    resolved.sourceType === 'manual_local_path'
                      ? `Active source: Manual Local Path (${resolved.localPath})`
                      : resolved.sourceType === 'default_registry'
                        ? `Active source: Default Registry (${resolved.registryId})`
                        : resolved.sourceType === 'manual_url'
                          ? 'Active source: Manual URL'
                          : resolved.sourceType === 'default_url'
                            ? 'Active source: Default URL'
                            : 'Active source: Missing';
                  setSettingsMessage(msg);
                }
                await updateLocalStatusFromRuntime();
              }}
            >
              <Text style={styles.secondaryBtnText}>Check Active Source</Text>
            </Pressable>
          </View>

          {localAiOutput ? <Text style={styles.item}>{localAiOutput}</Text> : null}
        </View>
      ) : null}

      <View style={styles.rowCard}>
        <Text style={styles.itemStrong}>AI Knowledge Scope</Text>
        <Pressable
          style={[styles.modelBtn, knowledgeScope === 'lesson_only' ? styles.modelBtnActive : null]}
          onPress={() => {
            const result = setKnowledgeScope('lesson_only');
            setSettingsMessage(result.message);
            refreshSettings();
          }}
        >
          <Text style={styles.modelText}>Lesson-only</Text>
          <Text style={styles.modelSubText}>AI answers only from the current lesson page.</Text>
        </Pressable>
        <Pressable
          style={[styles.modelBtn, knowledgeScope === 'general_tutor' ? styles.modelBtnActive : null]}
          onPress={() => {
            const result = setKnowledgeScope('general_tutor');
            setSettingsMessage(result.message);
            refreshSettings();
          }}
        >
          <Text style={styles.modelText}>General tutor</Text>
          <Text style={styles.modelSubText}>AI can use general knowledge for broader explanations.</Text>
        </Pressable>
        <Pressable
          style={styles.modelBtn}
          onPress={() => {
            const result = setKnowledgeScope('web_grounded');
            setSettingsMessage(result.message);
            refreshSettings();
          }}
        >
          <Text style={styles.modelText}>Web-grounded</Text>
          <Text style={styles.modelSubText}>Future mode. Uses online grounding if enabled by the API.</Text>
        </Pressable>
        <Text style={styles.item}>Web-grounded status: {isWebGroundingAvailable() ? 'Available' : 'Coming Soon'}</Text>
      </View>

      <View style={styles.rowCard}>
        <Text style={styles.itemStrong}>Current AI Status</Text>
        <Text style={styles.item}>Provider: {aiSettings.provider === 'gemini' ? 'Cloud AI' : 'Local AI'}</Text>
        <Text style={styles.item}>Active model: {aiSettings.cloudModel}</Text>
        <Text style={styles.item}>API Key: {isApiKeyConfigured() ? 'Configured' : 'Missing'}</Text>
        <Text style={styles.item}>Local AI: {isLocalAiAvailable() ? 'Available' : 'Coming Soon'}</Text>
        <Text style={styles.item}>Context mode: General chat does not send lesson content by default</Text>
      </View>

      <View style={styles.rowCard}>
        <Text style={styles.itemStrong}>App Preferences</Text>
        <Text style={styles.item}>UI language: English</Text>
        <Text style={styles.item}>Lesson content: Original language</Text>
        <Text style={styles.item}>Data sync: Local demo</Text>
        <Text style={styles.item}>Notifications: Demo only</Text>
      </View>
      <OnePadBackendSyncPanel />

      {settingsMessage ? <Text style={styles.notice}>{settingsMessage}</Text> : null}
    </View>
  );

  const renderSupport = () => (
    <View style={styles.sectionWrap}>
      <Text style={styles.item}>Need help with learning or app usage.</Text>
      <Pressable style={styles.primaryBtn} onPress={() => goToTool('support')}>
        <Text style={styles.primaryBtnText}>Open Support</Text>
      </Pressable>
    </View>
  );

  const renderVoiceCommand = () => (
    <VoiceCommandPanel
      currentScreen="home"
      currentLessonTitle={lesson.title}
      currentPageNumber={1}
      onExecute={(command) => {
        const message = onExecuteVoiceCommand(command);
        setSettingsMessage(message);
      }}
    />
  );

  const sectionMap: Record<StudentHubSection, React.ReactElement> = {
    home: renderHome(),
    info: renderInfo(),
    schedule: renderSchedule(),
    grades: renderGrades(),
    attendance: renderAttendance(),
    reports: renderReports(),
    charts: renderCharts(),
    assignments: renderAssignments(),
    notices: renderNotices(),
    groupWork: renderGroupWork(),
    voiceCommand: renderVoiceCommand(),
    tools: renderTools(),
    settings: renderSettings(),
    support: renderSupport()
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        if (activeSection !== 'home') {
          setActiveSection('home');
          return;
        }
        onClose();
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Student Hub</Text>
              <Text style={styles.headerSub}>{student.name}</Text>
              <Text style={styles.headerSub}>Grade {student.grade} / Class {student.className ?? '8A'}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>Close</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            {activeSection === 'home' ? 'Hub Menu' : activeSection === 'tools' ? 'Learning Tools' : activeSection === 'settings' ? 'AI & App Settings' : 'Section'}
          </Text>
          <ScrollView contentContainerStyle={styles.scrollBody}>
            {sectionMap[activeSection]}
          </ScrollView>

          {activeSection !== 'home' ? (
            <Pressable style={styles.secondaryBtn} onPress={() => setActiveSection('home')}>
              <Text style={styles.secondaryBtnText}>Back to Student Hub</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 30
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '88%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  headerSub: { marginTop: 2, fontSize: 13, color: '#64748b' },
  closeBtn: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10
  },
  closeBtnText: { color: '#0f172a', fontWeight: '700' },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8
  },
  scrollBody: {
    paddingBottom: 8
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  card: {
    width: '48%',
    minHeight: 84,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10
  },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  cardSubtitle: { marginTop: 4, fontSize: 12, color: '#64748b' },
  sectionWrap: {
    gap: 8
  },
  rowCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10
  },
  highlightCard: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff'
  },
  itemStrong: { fontSize: 13, fontWeight: '700', color: '#0f172a' },
  item: { marginTop: 4, fontSize: 13, color: '#334155' },
  badge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    color: '#1e3a8a',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
    fontWeight: '700'
  },
  progressTrack: {
    height: 8,
    marginTop: 6,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
    overflow: 'hidden'
  },
  progressFill: {
    height: 8,
    backgroundColor: '#2563eb'
  },
  progressFillAlt: {
    height: 8,
    backgroundColor: '#0ea5e9'
  },
  primaryBtn: {
    marginTop: 8,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  primaryBtnPressed: {
    backgroundColor: '#1d4ed8',
    transform: [{ scale: 0.98 }],
    opacity: 0.92
  },
  primaryBtnDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.6
  },
  primaryBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  primaryBtnText: { color: '#ffffff', fontWeight: '700' },
  itemSubtle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 6
  },
  localAiProgressBlock: {
    marginTop: 6
  },
  warnCard: {
    marginTop: 8,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb'
  },
  errorCard: {
    marginTop: 8,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2'
  },
  secondaryBtn: {
    marginTop: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  secondaryBtnSmall: {
    marginTop: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    flex: 1
  },
  secondaryBtnSmallPressed: {
    backgroundColor: '#cbd5e1',
    opacity: 0.92
  },
  secondaryBtnText: { color: '#0f172a', fontWeight: '700' },
  advancedCard: {
    marginTop: 12,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc'
  },
  advancedRow: {
    flexDirection: 'row',
    gap: 8
  },
  textInput: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    color: '#0f172a',
    backgroundColor: '#ffffff'
  },
  modelBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8
  },
  modelBtnActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff'
  },
  modelText: {
    color: '#0f172a',
    fontSize: 13,
    fontWeight: '600'
  },
  modelSubText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2
  },
  notice: {
    color: '#0f766e',
    fontWeight: '600',
    marginTop: 6
  }
});






