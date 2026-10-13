import { Slot } from "expo-router";
import { Text, View } from 'react-native';

export default function AuthLayout() {
  return (
    <>
      <View>
        <Text>AuthLayout</Text>
        <Text>AuthLayout</Text>
        <Text>AuthLayout</Text>
        <Text>AuthLayout</Text>
        <Text>AuthLayout</Text>
        <Text>AuthLayout</Text>
      </View>
      <Slot />
    </>
  )
}