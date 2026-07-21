import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { initDatabase } from '@/api/services/recoveryService';

SplashScreen.preventAutoHideAsync();
initDatabase(); // called at app startup

// Create a client for TanStack Query
// Used so dont have to use as many hooks, no duplicate fetches, gives error/loading states 
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // retry queries once if they fail 
      staleTime: 5 * 60 * 1000, // data fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // unused data in cache for 10 mins
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
