import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  interpolateColor,
  Extrapolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH * 0.85;
const BUTTON_SIZE = 60;
const SLIDE_RANGE = SLIDER_WIDTH - BUTTON_SIZE - 10;

interface StatusSliderProps {
  onComplete: () => void;
  isActive: boolean;
  disabled?: boolean;
  customLabel?: string;
}

export const StatusSlider: React.FC<StatusSliderProps> = ({ onComplete, isActive, disabled, customLabel }) => {
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (isActive) {
      translateX.value = withSpring(SLIDE_RANGE);
    } else {
      translateX.value = withSpring(0);
    }
  }, [isActive]);

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((event) => {
      if (isActive) {
        // If active, we slide back to 0 to "Pulang"
        translateX.value = Math.min(Math.max(0, SLIDE_RANGE + event.translationX), SLIDE_RANGE);
      } else {
        translateX.value = Math.min(Math.max(0, event.translationX), SLIDE_RANGE);
      }
    })
    .onEnd(() => {
      if (!isActive) {
        if (translateX.value > SLIDE_RANGE * 0.8) {
          translateX.value = withSpring(SLIDE_RANGE);
          runOnJS(onComplete)();
        } else {
          translateX.value = withSpring(0);
        }
      } else {
        // If active and slide back to start
        if (translateX.value < SLIDE_RANGE * 0.2) {
          translateX.value = withSpring(0);
          runOnJS(onComplete)();
        } else {
          translateX.value = withSpring(SLIDE_RANGE);
        }
      }
    });

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    backgroundColor: interpolateColor(
      translateX.value,
      [0, SLIDE_RANGE],
      ['#2196F3', '#F44336']
    ),
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SLIDE_RANGE * 0.2, SLIDE_RANGE * 0.8, SLIDE_RANGE],
      [1, 0, 0, 1],
      Extrapolate.CLAMP
    ),
  }));

  return (
    <View style={[styles.container, disabled && !isActive && styles.disabled]}>
      <View style={styles.sliderTrack}>
        <Animated.Text style={[styles.sliderText, animatedTextStyle]}>
          {isActive
            ? 'Geser untuk Pulang'
            : (customLabel
                ? (disabled ? `${customLabel} (Kunci)` : customLabel)
                : (disabled ? 'Mulai Bekerja (Kunci)' : 'Geser untuk Mulai')
              )
          }
        </Animated.Text>


        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.sliderButton, animatedButtonStyle]}>
            <Ionicons
              name={isActive ? 'exit' : 'chevron-forward'}
              size={30}
              color="#fff"
            />
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SLIDER_WIDTH,
    height: 70,
    backgroundColor: '#f0f0f0',
    borderRadius: 35,
    justifyContent: 'center',
    padding: 5,
    marginVertical: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  sliderTrack: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  sliderButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  sliderText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    zIndex: 1,
  },
});
