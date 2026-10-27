import type { validatePasswordType } from "./validatePassword";

export type PasswordStrengthType = {
  label: "Weak" | "Fair" | "Good" | "Strong";
  percent: number;
  color: string;
};

// Backward compatibility alias
export type passwordStrengthType = PasswordStrengthType;

export default function getPasswordStrength(rules: validatePasswordType): PasswordStrengthType {
  if (!Array.isArray(rules) || rules.length === 0) {
    return { label: "Weak", percent: 0, color: "text-red-500" };
  }

  const passed = rules.filter((r) => r.valid).length;

  if (passed <= 2) {
    return { label: "Weak", percent: 25, color: "text-red-500" };
  }
  if (passed <= 4) {
    return { label: "Fair", percent: 50, color: "text-yellow-500" };
  }
  if (passed <= 6) {
    return { label: "Good", percent: 75, color: "text-blue-500" };
  }
  return { label: "Strong", percent: 100, color: "text-green-400" };
}