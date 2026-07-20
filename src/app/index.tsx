import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { loadVideosController } from '@/api/controllers/recoveryController';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { VideoRecord } from '@/api/types';

export default function HomeScreen() {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadVideos() {
      try {
        const data = await loadVideosController();
        if (active) setVideos(data);
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
            videos.map((video) => (
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
              </Pressable>
            ))
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
});