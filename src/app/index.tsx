import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loadVideosController } from '@/api/controllers/recoveryController';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { VideoRecord } from '@/api/types';
import { loadVideoSummaries, type SummaryBlock } from './home-summary';

export default function HomeScreen() {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [summaries, setSummaries] = useState<Record<string, SummaryBlock>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadVideos() {
      try {
        const [data, cachedSummaries] = await Promise.all([
          loadVideosController(),
          loadVideoSummaries(),
        ]);

        if (active) {
          setVideos(data);
          setSummaries(cachedSummaries);
        }
      } catch (error) {
        console.warn('Failed to load videos', error);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadVideos();

    return () => {
      active = false;
    };
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title" style={styles.title}>
          Selected For You
        </ThemedText>

        <ThemedView style={styles.videoList}>
          {loading ? (
            <ThemedText type="small">Loading videos...</ThemedText>
          ) : videos.length === 0 ? (
            <ThemedText type="small">No videos available yet.</ThemedText>
          ) : (
            videos.map((video) => {
              const summary = summaries[video.id];

              return (
                <Pressable
                  key={video.id}
                  onPress={() => Linking.openURL(video.source)}
                  style={styles.videoCard}
                >
                  <ThemedText type="default" style={styles.videoTitle}>
                    {video.title}
                  </ThemedText>
                  <ThemedText type="small" style={styles.videoMeta}>
                    {`topic: ${video.topic}`}
                  </ThemedText>
                  {summary ? (
                    <ThemedView style={styles.summaryBlock}>
                      {/* <ThemedText type="small" style={styles.summaryLabel}>
                        Summary
                      </ThemedText>
                      <ThemedText type="small">{summary.summary}</ThemedText> */}

                      <ThemedText type="small" style={styles.summaryLabel}>
                        Tips / Tricks
                      </ThemedText>
                      {summary.tipsAndTricks?.map((tip) => (
                        <ThemedText key={tip} type="small">
                          • {tip}
                        </ThemedText>
                      ))}

                      <ThemedText type="small" style={styles.summaryLabel}>
                        Action Plan
                      </ThemedText>
                      {summary.actionPlan?.map((step) => (
                        <ThemedText key={step} type="small">
                          • {step}
                        </ThemedText>
                      ))}
                    </ThemedView>
                  ) : null}
                </Pressable>
              );
            })
          )}
        </ThemedView>
        {Platform.OS === 'web' && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  title: {
    textAlign: 'center',
    fontSize: 24,
  },
  videoList: {
    width: '100%',
    gap: Spacing.two,
  },
  videoCard: {
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
    marginTop: Spacing.one / 2,
  },
});