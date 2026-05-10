import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { assignment, lesson, mastery, student, todayLessons } from '../data/mockData';
import { mockDailyBodyLogs, mockPhysicalHealthProfile } from '../data/mockPhysicalHealthData';
import StudentHubMenu from '../components/StudentHubMenu';
import { executeVoiceCommand } from '../services/appActionExecutor';
import { createBodyReadinessSnapshot } from '../services/health/bodyReadinessEngine';
import { createWeeklyMovementPlan } from '../services/health/movementPlanEngine';
import { getArModelsFromLesson } from '../services/lessonEngine';
import { fetchLessonInbox } from '../services/lessons/publishedLessonService';
import { setActivePublishedLessonId } from '../services/lessons/publishedLessonRuntimeStore';
import { getActiveMockLesson, setActiveMockLessonId } from '../services/lessons/mockLessonRuntimeStore';
import { getBottomInset, getTopInset } from '../services/mobileViewport';
import { getProgressInsight } from '../services/progressEngine';
import type { VoiceCommandResult } from '../services/voiceLocalCommandMatcher';

export type HomeRouteTarget =
  | 'lessonReader'
  | 'aiTutor'
  | 'quiz'
  | 'progress'
  | 'advanced'
  | 'arLab'
  | 'groupWork'
  | 'lectureRecorder'
  | 'support'
  | 'healthDashboard'
  | 'movementPlan'
  | 'wellbeingCheckIn'
  | 'supportCircle'
  | 'guardianReportPreview';

type HomeButton = {
  label: string;
  target: HomeRouteTarget;
};

type SearchItem = {
  id: string;
  label: string;
  target: HomeRouteTarget;
  keywords: string[];
};

type HomeScreenProps = {
  onNavigate: (target: HomeRouteTarget) => void;
};

const QUICK_ACTIONS: HomeButton[] = [
  { label: 'Continue Learning', target: 'lessonReader' },
  { label: "Today's Lesson", target: 'lessonReader' },
  { label: 'AI Tutor', target: 'aiTutor' },
  { label: 'Quick Quiz', target: 'quiz' },
  { label: 'Progress', target: 'progress' }
];

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [showStudentHub, setShowStudentHub] = React.useState<boolean>(false);
  const [studentHubSection, setStudentHubSection] = React.useState<
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
    | 'support'
  >('home');
  const [searchText, setSearchText] = React.useState<string>('');
  const [topBarMessage, setTopBarMessage] = React.useState<string>('');
  const [publishedLessons, setPublishedLessons] = React.useState<any[]>([]);
  const progressInsight = getProgressInsight();
  const [selectedLessonId, setSelectedLessonId] = React.useState<string>(getActiveMockLesson(lesson).id);
  const selectedLesson = todayLessons.find((item) => item.id === selectedLessonId) ?? getActiveMockLesson(lesson);
  const readiness = createBodyReadinessSnapshot('student_minh_001', mockDailyBodyLogs);
  const movementPlan = createWeeklyMovementPlan(mockPhysicalHealthProfile, readiness);
  const latestBodyLog = mockDailyBodyLogs[mockDailyBodyLogs.length - 1];

  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      const lessons = await fetchLessonInbox('class_8a');
      if (!mounted) return;
      setPublishedLessons(lessons);
      if (lessons.length > 0) {
        setActivePublishedLessonId(lessons[0].lessonId);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  const arLabels = getArModelsFromLesson(selectedLesson).map((item) => item.label);
  const openLesson = (lessonId = selectedLesson.id) => {
    setActiveMockLessonId(lessonId);
    setSelectedLessonId(lessonId);
    onNavigate('lessonReader');
  };

  const searchItems: SearchItem[] = [
    {
      id: 'lesson-main',
      label: `${selectedLesson.subject} - ${selectedLesson.title}`,
      target: 'lessonReader',
      keywords: [selectedLesson.subject, selectedLesson.title, 'lesson', 'today lesson', 'continue learning']
    },
    {
      id: 'quiz-main',
      label: 'Quick Quiz',
      target: 'quiz',
      keywords: ['quiz', 'practice', 'question', assignment.title]
    },
    {
      id: 'ai-main',
      label: 'AI Tutor',
      target: 'aiTutor',
      keywords: ['ai', 'tutor', 'ask ai', 'explain']
    },
    {
      id: 'progress-main',
      label: 'Progress',
      target: 'progress',
      keywords: ['progress', 'mastery', 'score']
    },
    {
      id: 'ar-lab',
      label: 'AR Lab',
      target: 'arLab',
      keywords: ['ar', '3d', 'model', ...arLabels]
    },
    {
      id: 'advanced',
      label: 'Advanced Challenge',
      target: 'advanced',
      keywords: ['advanced', 'challenge', 'hard']
    },
    {
      id: 'recorder',
      label: 'Lecture Recorder',
      target: 'lectureRecorder',
      keywords: ['record', 'transcript', 'lecture']
    },
    {
      id: 'support',
      label: 'Support',
      target: 'support',
      keywords: ['support', 'help', 'school problem', 'teacher']
    },
    {
      id: 'health-dashboard',
      label: 'Health Dashboard',
      target: 'healthDashboard',
      keywords: ['health', 'readiness', 'sleep', 'energy', 'movement']
    },
    {
      id: 'wellbeing-checkin',
      label: 'Wellbeing Check-in',
      target: 'wellbeingCheckIn',
      keywords: ['wellbeing', 'check in', 'feeling', 'stress', 'support']
    },
    {
      id: 'group-work',
      label: 'Group Work',
      target: 'groupWork',
      keywords: ['group', 'team', 'assignment', 'discussion']
    }
  ];

  const normalizedSearch = searchText.trim().toLowerCase();
  const searchResults =
    normalizedSearch.length === 0
      ? []
      : searchItems.filter((item) => {
          const haystack = [item.label, ...item.keywords].join(' ').toLowerCase();
          return haystack.includes(normalizedSearch);
        });

  const openStudentHubSection = (section: typeof studentHubSection) => {
    setStudentHubSection(section);
    setShowStudentHub(true);
  };

  const handleVoiceExecute = (command: VoiceCommandResult): string => {
    const outcome = executeVoiceCommand(command, {
      navigate: onNavigate,
      openStudentHub: () => openStudentHubSection('home'),
      openStudentHubSection,
      currentScreen: 'home'
    });
    setTopBarMessage(outcome.message);
    return outcome.message;
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topBar}>
          <View style={styles.brandWrap}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>OS</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>OnePad School</Text>
              <Text style={styles.brandSub}>Student Portal</Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <Pressable style={styles.iconButton} onPress={() => setTopBarMessage('No new notifications.')}>
              <Text style={styles.iconText}>N</Text>
            </Pressable>
            <Pressable style={styles.avatarButton} onPress={() => setTopBarMessage(`Profile: ${student.name}`)}>
              <Text style={styles.avatarText}>A</Text>
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => setShowStudentHub(true)}>
              <Text style={styles.iconText}>...</Text>
            </Pressable>
          </View>
        </View>

        {topBarMessage ? (
          <View style={styles.noticeCard}>
            <Text style={styles.noticeText}>{topBarMessage}</Text>
          </View>
        ) : null}

        <View style={styles.headerRow}>
          <Text style={styles.greeting}>Hello, {student.name}</Text>
          <Text style={styles.subtleText}>{today}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Search</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search lessons, quizzes, tools..."
            placeholderTextColor="#6b7280"
            value={searchText}
            onChangeText={setSearchText}
          />
          {normalizedSearch.length > 0 ? (
            <View style={styles.searchResults}>
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.searchResultItem}
                    onPress={() => onNavigate(item.target)}
                  >
                    <Text style={styles.searchResultText}>{item.label}</Text>
                  </Pressable>
                ))
              ) : (
                <Text style={styles.noResultText}>No results found.</Text>
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <Text style={styles.heroTitle}>{selectedLesson.subject} - {selectedLesson.title}</Text>
          <Text style={styles.cardText}>Grade {selectedLesson.grade}</Text>
          <Text style={styles.cardText}>Progress: {mastery.level}%</Text>
          <Pressable style={styles.primaryButton} onPress={() => openLesson()}>
            <Text style={styles.primaryButtonText}>Resume Lesson</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Lessons</Text>
          <Text style={styles.cardText}>Choose the subject you want to study now.</Text>
          {todayLessons.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.lessonChoice, selectedLessonId === item.id ? styles.lessonChoiceActive : null]}
              onPress={() => {
                setSelectedLessonId(item.id);
                setActiveMockLessonId(item.id);
              }}
            >
              <View style={styles.lessonChoiceTextWrap}>
                <Text style={styles.lessonChoiceTitle}>{item.subject}</Text>
                <Text style={styles.lessonChoiceSubtitle} numberOfLines={2}>{item.title} - {item.pages.length} pages</Text>
              </View>
              <Pressable style={styles.smallStartButton} onPress={() => openLesson(item.id)}>
                <Text style={styles.smallStartButtonText}>Study</Text>
              </Pressable>
            </Pressable>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Plan</Text>
          <Text style={styles.cardText}>1. Study the selected lesson: {selectedLesson.title}</Text>
          <Text style={styles.cardText}>2. Review one weak point from recent quizzes.</Text>
          <Text style={styles.cardText}>3. Take a quick quiz using only a small lesson slice.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Body Readiness</Text>
          <Text style={styles.heroTitle}>Status: {readiness.readinessLevel.replace('_', ' ')}</Text>
          <Text style={styles.cardText}>Sleep: {readiness.sleepTrend.replace('_', ' ')}</Text>
          <Text style={styles.cardText}>Energy: {latestBodyLog?.energyLevel ?? '-'} / 5</Text>
          <Text style={styles.cardText}>Suggestion: {readiness.learningRecommendation.replace('_', ' ')}</Text>
          <Pressable style={styles.primaryButton} onPress={() => onNavigate('healthDashboard')}>
            <Text style={styles.primaryButtonText}>View Health Dashboard</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today's Healthy Routine</Text>
          {movementPlan.items.slice(0, 3).map((item) => (
            <Text key={item.id} style={styles.cardText}>
              - {item.durationMinutes}-minute {item.title.toLowerCase()}
            </Text>
          ))}
          <Text style={styles.cardText}>- Keep tonight's study block short if energy feels lower.</Text>
          <Pressable style={styles.primaryButton} onPress={() => onNavigate('movementPlan')}>
            <Text style={styles.primaryButtonText}>Open Movement Plan</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Wellbeing Check-in</Text>
          <Text style={styles.cardText}>How are you feeling about school today?</Text>
          <Text style={styles.cardText}>Quick check-in helps OnePad adjust your learning path.</Text>
          <View style={styles.inlineActions}>
            <Pressable style={styles.inlineButton} onPress={() => onNavigate('wellbeingCheckIn')}>
              <Text style={styles.inlineButtonText}>Quick Check-in</Text>
            </Pressable>
            <Pressable style={styles.inlineButton} onPress={() => onNavigate('supportCircle')}>
              <Text style={styles.inlineButtonText}>Ask for Support</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Assigned Lessons Inbox</Text>
          {publishedLessons.length === 0 ? (
            <Text style={styles.cardText}>No published lesson yet. Showing built-in lesson fallback.</Text>
          ) : (
            publishedLessons.slice(0, 3).map((item) => (
              <Pressable
                key={item.lessonId}
                style={styles.searchResultItem}
                onPress={() => {
                  setActivePublishedLessonId(item.lessonId);
                  onNavigate('lessonReader');
                }}
              >
                <Text style={styles.searchResultText}>{item.lessonId} ({item.classId})</Text>
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((button) => (
              <Pressable
                key={`${button.target}-${button.label}`}
                style={styles.quickAction}
                onPress={() => button.target === 'lessonReader' ? openLesson() : onNavigate(button.target)}
              >
                <Text style={styles.quickActionText}>{button.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.cardText}>You reviewed "{selectedLesson.title}" pages today.</Text>
          <Text style={styles.cardText}>Last quiz mastery trend: {mastery.level}%.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <Text style={styles.cardText}>Revisit membrane and nucleus concepts.</Text>
          <Text style={styles.cardText}>Try one challenge from Advanced Challenge.</Text>
          <Pressable style={styles.primaryButton} onPress={() => onNavigate('groupWork')}>
            <Text style={styles.primaryButtonText}>Open Group Work</Text>
          </Pressable>
        </View>

        <Pressable style={styles.moreToolsButton} onPress={() => setShowStudentHub(true)}>
          <Text style={styles.moreToolsButtonText}>Student Hub</Text>
        </Pressable>
      </ScrollView>

      <StudentHubMenu
        visible={showStudentHub}
        onClose={() => setShowStudentHub(false)}
        onNavigate={onNavigate}
        student={student}
        lesson={lesson}
        assignment={assignment}
        progressInsight={progressInsight}
        initialSection={studentHubSection}
        onExecuteVoiceCommand={handleVoiceExecute}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f3f6fb' },
  container: {
    paddingTop: getTopInset(),
    paddingHorizontal: 16,
    paddingBottom: getBottomInset(24)
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  brandWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoText: { color: '#ffffff', fontWeight: '700', fontSize: 12 },
  brandTitle: { color: '#0f172a', fontWeight: '700', fontSize: 15 },
  brandSub: { marginTop: 2, color: '#64748b', fontSize: 12 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconText: { color: '#0f172a', fontSize: 12, fontWeight: '700' },
  avatarButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: { color: '#1e3a8a', fontWeight: '700', fontSize: 13 },
  noticeCard: {
    backgroundColor: '#e0f2fe',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10
  },
  noticeText: {
    color: '#075985',
    fontWeight: '600',
    fontSize: 13
  },
  headerRow: { marginBottom: 12 },
  greeting: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtleText: { marginTop: 4, color: '#6b7280', fontSize: 13 },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 10
  },
  heroTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 6 },
  cardText: { fontSize: 14, color: '#475569', marginBottom: 6 },
  lessonChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8
  },
  lessonChoiceActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff'
  },
  lessonChoiceTextWrap: { flex: 1 },
  lessonChoiceTitle: { color: '#0f172a', fontWeight: '800', fontSize: 14 },
  lessonChoiceSubtitle: { color: '#475569', marginTop: 2, fontSize: 12 },
  smallStartButton: {
    minWidth: 62,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center'
  },
  smallStartButtonText: { color: '#ffffff', fontWeight: '800', fontSize: 12 },
  searchInput: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dbe3ef',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: '#0f172a'
  },
  searchResults: {
    marginTop: 10
  },
  searchResultItem: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#dbe3ef',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8
  },
  searchResultText: {
    color: '#1f2937',
    fontWeight: '600'
  },
  noResultText: {
    color: '#64748b',
    fontSize: 13
  },
  primaryButton: {
    marginTop: 6,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center'
  },
  primaryButtonText: { color: '#ffffff', fontWeight: '700' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickAction: {
    minWidth: '48%',
    backgroundColor: '#eef4ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  quickActionText: { color: '#1e3a8a', fontSize: 13, fontWeight: '600' },
  inlineActions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  inlineButton: {
    flex: 1,
    backgroundColor: '#eef4ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  inlineButtonText: { color: '#1e3a8a', fontSize: 13, fontWeight: '700' },
  moreToolsButton: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  moreToolsButtonText: { color: '#ffffff', fontWeight: '700' },
});
