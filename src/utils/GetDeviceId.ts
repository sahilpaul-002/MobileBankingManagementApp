import * as Application from "expo-application";
import * as Crypto from "expo-crypto";
import { Platform } from "react-native";

let cachedDeviceId: string | null = null;

const generateFallbackId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return Crypto.randomUUID();;
  }
  return "dev-" + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const GetDeviceId = async (): Promise<string> => {
  if (cachedDeviceId) {
    return cachedDeviceId;
  }

  try {
    if (Platform.OS === "android") {
      const androidId = Application.getAndroidId();
      if (androidId) {
        cachedDeviceId = androidId;
        return cachedDeviceId;
      }
    } else if (Platform.OS === "ios") {
      const iosId = await Application.getIosIdForVendorAsync();
      if (iosId) {
        cachedDeviceId = iosId;
        return cachedDeviceId;
      }
    }
  } catch {
    // Native API unavailable or failed; proceed to fallback
  }

  cachedDeviceId = generateFallbackId();
  return cachedDeviceId;
};

export default GetDeviceId;
