import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '@/lib/db';
import { ItemsProvider } from '@/lib/items-context';
import { colors } from '@/lib/theme';

export default function RootLayout() {
  return (
    <ItemsProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      />
    </ItemsProvider>
  );
}
