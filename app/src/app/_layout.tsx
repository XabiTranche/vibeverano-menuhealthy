import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import '../i18n';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [checkedOnce, setCheckedOnce] = useState(false);

  // Check if user has a family (determine onboarding need)
  useEffect(() => {
    if (loading || !session) {
      setNeedsOnboarding(null);
      setCheckedOnce(false);
      return;
    }

    // Only check once per session — after onboarding creates the family,
    // we set needsOnboarding to false directly
    if (checkedOnce) return;

    supabase
      .from('families')
      .select('id')
      .eq('owner_id', session.user.id)
      .limit(1)
      .then(({ data }) => {
        setNeedsOnboarding(!data || data.length === 0);
        setCheckedOnce(true);
      });
  }, [session, loading, checkedOnce]);

  // Navigate based on auth + onboarding state
  useEffect(() => {
    if (loading) return;
    if (session && needsOnboarding === null) return;

    const inAuthGroup = segments[0] === 'login';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/login');
    } else if (session && inAuthGroup) {
      if (needsOnboarding) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/plan');
      }
    }
    // Don't redirect to onboarding if user is already past login —
    // the onboarding screen handles its own navigation when done
  }, [session, loading, segments, needsOnboarding]);

  if (loading || (session && needsOnboarding === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="member/[id]" />
      <Stack.Screen name="substitute/[mealId]" />
      <Stack.Screen name="recipe/[id]" />
      <Stack.Screen name="recipe/form" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
