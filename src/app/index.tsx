import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { Spacing } from '@/constants/theme';
import { QuestionKey } from '@/api/types';
import { loadVideoSummaries, type SummaryBlock } from './home-summary';

const questions: Array<{ key: QuestionKey; label: string; videoId: string }> = [
  { key: 'anxiety', label: 'How has your anxiety been?', videoId: 'v1' },
  { key: 'stress', label: 'How is your stress?', videoId: 'v2' },
  { key: 'depression', label: 'How has your depression been?', videoId: 'v3' },
];

// Map video IDs to URLs and titles
const videoData: Record<string, { url: string; title: string }> = {
  v1: { url: 'https://www.youtube.com/watch?v=FpiWSFcL3-c', title: 'Managing Anxiety' },
  v2: { url: 'https://www.youtube.com/watch?v=RcGyVTAoXEU&t=459s', title: 'Understanding Stress' },
  v3: { url: 'https://www.youtube.com/watch?v=HWcphoKlbxY', title: 'Coping with Depression' },
};

export default function HomeScreen() {
  const [responses, setResponses] = useState<Record<QuestionKey, number | null>>({
    stress: null,
    anxiety: null,
    depression: null,
  });
  const [summaries, setSummaries] = useState<Record<string, SummaryBlock>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const cachedSummaries = await loadVideoSummaries();
        if (active) {
          setSummaries(cachedSummaries);
        }
      } catch (error) {
        console.warn('Failed to load summaries', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const selectOption = (key: QuestionKey, value: number) => {
    setResponses((current) => ({ ...current, [key]: value }));
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedText type="subtitle" style={styles.title}>
            How are you feeling today?
          </ThemedText>

          {questions.map((question) => {
            const selectedValue = responses[question.key];
            const showVideo = selectedValue !== null && selectedValue >= 3;
            const summary = summaries[question.videoId];
            const video = videoData[question.videoId];

            return (
              <ThemedView key={question.key} style={styles.questionSection}>
                {/* Question Bubble */}
                <ThemedView style={styles.bubble}>
                  <ThemedText type="default" style={styles.question}>
                    {question.label}
                  </ThemedText>
                  <ThemedView style={styles.optionsRow}>
                    {[1, 2, 3, 4, 5].map((value) => {
                      const isSelected = selectedValue === value;

                      return (
                        <Pressable
                          key={value}
                          onPress={() => selectOption(question.key, value)}
                          style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                        >
                          <ThemedText
                            type="smallBold"
                            style={[styles.optionText, isSelected && styles.optionTextSelected]}
                          >
                            {value}
                          </ThemedText>
                        </Pressable>
                      );
                    })}
                  </ThemedView>
                </ThemedView>

                {/* Video Tile - Only shown if score >= 3 */}
                {showVideo && video && (
                  <Pressable onPress={() => Linking.openURL(video.url)} style={styles.videoCard}>
                    <ThemedText type="default" style={styles.videoTitle}>
                      {video.title}
                    </ThemedText>
                    <ThemedText type="small" style={styles.videoMeta}>
                      Tap to watch • {question.key}
                    </ThemedText>

                    {summary && !loading ? (
                      <ThemedView style={styles.summaryBlock}>
                        <ThemedText type="small" style={styles.summaryLabel}>
                          Tips & Tricks
                        </ThemedText>
                        {summary.tipsAndTricks?.map((tip, idx) => (
                          <ThemedText key={idx} type="small" style={styles.bulletText}>
                            • {tip}
                          </ThemedText>
                        ))}

                        <ThemedText type="small" style={styles.summaryLabel}>
                          Action Plan
                        </ThemedText>
                        {summary.actionPlan?.map((step, idx) => (
                          <ThemedText key={idx} type="small" style={styles.bulletText}>
                            • {step}
                          </ThemedText>
                        ))}
                      </ThemedView>
                    ) : null}
                  </Pressable>
                )}
              </ThemedView>
            );
          })}

          {Platform.OS === 'web' && <WebBadge />}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
  },
  scrollContent: {
    gap: Spacing.two,
  },
  title: {
    textAlign: 'center',
    marginBottom: Spacing.one,
    fontSize: 25,
  },
  questionSection: {
    width: '100%',
    gap: Spacing.two,
  },
  bubble: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  question: {
    marginBottom: Spacing.two,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  optionButton: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C7C9D1',
    borderRadius: 999,
    paddingHorizontal: Spacing.one,
  },
  optionButtonSelected: {
    backgroundColor: '#3c87f7',
    borderColor: '#3c87f7',
  },
  optionText: {
    color: '#3c87f7',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  videoCard: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    padding: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(60, 135, 247, 0.12)',
  },
  videoTitle: {
    fontWeight: '600',
  },
  videoMeta: {
    marginTop: Spacing.one / 2,
    opacity: 0.8,
  },
  summaryBlock: {
    marginTop: Spacing.one,
    gap: Spacing.one / 2,
  },
  summaryLabel: {
    fontWeight: '700',
    marginTop: Spacing.one,
    marginBottom: Spacing.one / 4,
  },
  bulletText: {
    lineHeight: 20,
    paddingLeft: Spacing.one,
    marginBottom: Spacing.one / 4,
  },
});