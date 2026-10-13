import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <>
      {/* <Slot /> */}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </>
  )
}