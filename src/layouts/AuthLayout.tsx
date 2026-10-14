import { Slot } from "expo-router";
import { View } from "react-native";

export default function AuthLayout() {
  return (
    <View className="w-full h-full">
      <Slot />
      {/* <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      /> */}
    </View>
  )
}