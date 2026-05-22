import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  rut?: number;
  dv_rut?: string;
  phone: string;
  name: string;
  photo_url: string | null;
  level: string | null;
  zone: string | null;
  mmr: number;
  role: string;
  is_active: boolean;
  created_at?: string;
}

const MOCK_USERS: (User & { password: string; token: string })[] = [
  {
    id: "e8a1b3c4-ad56-4d23-9871-bcde12345678",
    rut: 12345678,
    dv_rut: "9",
    name: "Felipe Martínez",
    phone: "+56987654321",
    password: "12345678",
    level: "4ta",
    zone: "Valparaíso",
    mmr: 1248,
    photo_url: null,
    role: "player",
    is_active: true,
    created_at: "2026-01-15T14:30:00.000Z",
    token: "mock-jwt-token-felipe-abc123",
  },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── HU-002: Login ──────────────────────────────────────────────────────────────
export async function loginUser(
  phone: string,
  password: string
): Promise<{ token: string; user: User }> {
  await delay(800);
  const found = MOCK_USERS.find(
    (u) => u.phone === phone && u.password === password
  );
  if (!found) throw new Error("Teléfono o contraseña incorrectos");
  const { password: _, token, ...user } = found;
  await AsyncStorage.setItem("ph_token", token);
  await AsyncStorage.setItem("ph_user", JSON.stringify(user));
  return { token, user };
}

// ── HU-001a: Solo registrar (sin iniciar sesión) ───────────────────────────────
export interface RegisterData {
  rut: number;
  dv_rut: string;
  name: string;
  phone: string;
  password: string;
  zone: string;
}

export async function signUpUser(data: RegisterData): Promise<void> {
  await delay(1000);
  if (MOCK_USERS.find((u) => u.phone === data.phone)) {
    throw new Error("Este número ya está registrado");
  }
  const token = `mock-jwt-${Date.now()}`;
  const user: User = {
    id: `mock-${Date.now()}`,
    rut: data.rut,
    dv_rut: data.dv_rut,
    name: data.name,
    phone: data.phone,
    zone: data.zone,
    level: null,
    mmr: 1000,
    photo_url: null,
    role: "player",
    is_active: true,
    created_at: new Date().toISOString(),
  };
  MOCK_USERS.push({ ...user, password: data.password, token });
}

// ── HU-001b: Registro + login automático ──────────────────────────────────────
export async function registerUser(data: RegisterData): Promise<{ token: string; user: User }> {
  await delay(1000);
  if (MOCK_USERS.find((u) => u.phone === data.phone)) {
    throw new Error("Este número ya está registrado");
  }
  const token = `mock-jwt-${Date.now()}`;
  const user: User = {
    id: `mock-${Date.now()}`,
    rut: data.rut,
    dv_rut: data.dv_rut,
    name: data.name,
    phone: data.phone,
    zone: data.zone,
    level: null,
    mmr: 1000,
    photo_url: null,
    role: "player",
    is_active: true,
    created_at: new Date().toISOString(),
  };
  MOCK_USERS.push({ ...user, password: data.password, token });
  await AsyncStorage.setItem("ph_token", token);
  await AsyncStorage.setItem("ph_user", JSON.stringify(user));
  return { token, user };
}

// ── HU-003: Editar perfil ──────────────────────────────────────────────────────
export async function updateProfile(
  userId: string,
  data: Partial<User>
): Promise<User> {
  await delay(700);
  const i = MOCK_USERS.findIndex((u) => u.id === userId);
  if (i === -1) throw new Error("Usuario no encontrado");
  Object.assign(MOCK_USERS[i], data);
  const { password: _, token: __, ...user } = MOCK_USERS[i];
  await AsyncStorage.setItem("ph_user", JSON.stringify(user));
  return user;
}

// ── HU-004: Logout ─────────────────────────────────────────────────────────────
export async function logoutUser(): Promise<void> {
  await delay(200);
  await AsyncStorage.removeItem("ph_token");
  await AsyncStorage.removeItem("ph_user");
}

// ── HU-005: Recuperar contraseña ───────────────────────────────────────────────
export async function forgotPassword(phone: string): Promise<void> {
  await delay(1200);
  if (!MOCK_USERS.find((u) => u.phone === phone)) {
    throw new Error("No existe una cuenta con ese número");
  }
  console.log(`[MOCK] OTP enviado a ${phone}: 123456`);
}

export async function resetPassword(
  phone: string,
  newPassword: string
): Promise<void> {
  await delay(800);
  const user = MOCK_USERS.find((u) => u.phone === phone);
  if (!user) throw new Error("Usuario no encontrado");
  user.password = newPassword;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
export async function getStoredUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem("ph_user");
  return raw ? JSON.parse(raw) : null;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await AsyncStorage.getItem("ph_token");
  return !!token;
}
