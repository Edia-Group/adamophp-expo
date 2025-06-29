import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/contexts/auth';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, StatusBar } from 'react-native';
import 'react-native-reanimated';


SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  // @ts-ignore
  const { isLoading, isAuthenticated, isFirstLaunch, isAnonymous } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    SplashScreen.hideAsync();

    const inAuthGroup = segments[0] === '(auth)';

    if (isFirstLaunch && !inAuthGroup) {
      router.replace('/login');
      return;
    }

    // If the user is fully authenticated and tries to access an auth screen, redirect them away.
    if (isAuthenticated && !isAnonymous && inAuthGroup) {
      router.replace('/');
    }
    // If the user is not authenticated at all and is trying to access a protected screen, redirect to login.
    else if (!isAuthenticated && !inAuthGroup) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, isFirstLaunch, isAnonymous, segments]);

  // While loading, show a spinner.
  if (isLoading) {
    return (
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator
              size="large"
              color={colorScheme === 'dark' ? Colors.dark.tint : Colors.light.tint}
          />
        </ThemedView>
    );
  }

  // Once loaded, show the main navigation stack.
  // @ts-ignore
  return (
      <>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </>
  );
}


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
  );
}