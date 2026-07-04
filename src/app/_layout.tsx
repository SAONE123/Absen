import { Stack } from 'expo-router';
import { useEmployee } from '@/hooks/useEmployee';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const { isReady } = useEmployee();

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* (tabs) akan menangani pengecekan login internal */}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login_root" />
      </Stack>
    </GestureHandlerRootView>
  );
}
