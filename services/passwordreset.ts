import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "./api";

const RESET_TOKEN_KEY = "ph_reset_token";

export async function sendSmsOtp(rut: number): Promise<void> {
  await apiFetch<{ message: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ rut }),
  });
}

export async function verifyOtp(rut: number, otp: string): Promise<void> {
  const data = await apiFetch<{ resetToken: string }>("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ rut, otp }),
  });
  await AsyncStorage.setItem(RESET_TOKEN_KEY, data.resetToken);
}

export async function resetPasswordWithOtp(newPassword: string): Promise<void> {
  const resetToken = await AsyncStorage.getItem(RESET_TOKEN_KEY);
  if (!resetToken) throw new Error("Sesión de recuperación expirada. Inicia el proceso de nuevo.");

  await apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ resetToken, newPassword }),
  });

  await AsyncStorage.removeItem(RESET_TOKEN_KEY);
}
