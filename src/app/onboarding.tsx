import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Logo } from '@/components/Logo';
import { useItems } from '@/lib/items-context';
import { colors, fontSize, radius, spacing } from '@/lib/theme';

const EXAMPLES = ['Push-ups', 'Glasses of water', 'Cigarettes', 'Coffees'];

export default function Onboarding() {
  const { finishOnboarding } = useItems();
  const [name, setName] = useState('');
  const canSubmit = name.trim().length > 0;

  function submit() {
    if (!canSubmit) return;
    finishOnboarding(name);
    router.replace('/');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Logo size={64} />
          <Text style={styles.title}>Welcome to TapTally</Text>
          <Text style={styles.subtitle}>What do you want to keep count of?</Text>

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Push-ups"
            placeholderTextColor={colors.muted}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
          />

          <View style={styles.examples}>
            {EXAMPLES.map((example) => (
              <Pressable key={example} style={styles.chip} onPress={() => setName(example)}>
                <Text style={styles.chipText}>{example}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={submit}
            disabled={!canSubmit}
          >
            <Text style={styles.buttonText}>Get started</Text>
          </Pressable>

          <Text style={styles.hint}>You can add more items and rename this anytime in Settings.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.lg,
    color: colors.ink,
  },
  examples: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  chipText: {
    color: colors.ink,
    fontSize: fontSize.sm,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.surface,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  hint: {
    color: colors.muted,
    fontSize: fontSize.xs,
    textAlign: 'center',
  },
});
