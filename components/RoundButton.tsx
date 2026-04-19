import { useRef } from 'react';
import { Animated, TouchableWithoutFeedback, View, Text, StyleSheet } from 'react-native';
import { colors, font } from '../constants/theme';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

export function RoundButton({ onPress, disabled }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: false, speed: 50 }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: false, speed: 20, bounciness: 12 }).start();
    if (!disabled) onPress();
  }

  return (
    <TouchableWithoutFeedback onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={disabled}>
      <Animated.View style={[s.btn, disabled && s.btnDisabled, { transform: [{ scale }] }]}>
        <Text style={s.emoji}>🍺</Text>
        <Text style={s.label}>I bought{'\n'}the round</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const s = StyleSheet.create({
  btn: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  btnDisabled: {
    backgroundColor: colors.surfaceAlt,
    shadowOpacity: 0,
  },
  emoji: { fontSize: 48, marginBottom: 4 },
  label: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.background,
    textAlign: 'center',
  },
});
