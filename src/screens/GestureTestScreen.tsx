
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from 'react-native-gesture-handler';

export default function GestureTestScreen() {
  const [message, setMessage] = useState('Swipe left or right');
  const [count, setCount] = useState(0);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-30, 30])
    .failOffsetY([-15, 15])
    .runOnJS(true)
    .onEnd((event) => {
      if (event.translationX < -30) {
        setMessage('Swiped left');
        setCount((previous) => previous + 1);
      } else if (event.translationX > 30) {
        setMessage('Swiped right');
        setCount((previous) => previous + 1);
      }
    });

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign Up Gesture Test</Text>

        <GestureDetector gesture={swipeGesture}>
          <View style={styles.gestureArea}>
            <Text style={styles.gestureText}>
              {message}
            </Text>
            <Text style={styles.description}>
              Swipe horizontally inside this area
            </Text>
          </View>
        </GestureDetector>

        <Text style={styles.counter}>
          Successful gestures: {count}
        </Text>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#0B1220',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 32,
  },
  gestureArea: {
    width: '100%',
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D49A4D',
    borderRadius: 16,
    backgroundColor: '#16264A',
  },
  gestureText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  description: {
    color: '#CBD5E1',
    marginTop: 12,
  },
  counter: {
    color: '#FFFFFF',
    marginTop: 24,
  },
});
