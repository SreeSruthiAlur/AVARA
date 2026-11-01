import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default URLs: Android emulator uses 10.0.2.2, Web/iOS uses localhost
const DEFAULT_API_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
export const API_BASE_URL = `${DEFAULT_API_HOST}/api/v1`;

const TOKEN_KEY = '@avara_access_token';
const API_URL_KEY = '@avara_api_base_url';

export async function getBaseUrl(): Promise<string> {
  try {
    const custom = await AsyncStorage.getItem(API_URL_KEY);
    return custom || API_BASE_URL;
  } catch {
    return API_BASE_URL;
  }
}

export async function setCustomBaseUrl(url: string): Promise<void> {
  await AsyncStorage.setItem(API_URL_KEY, url);
}

export async function getStoredToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setStoredToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = await getBaseUrl();
  const token = await getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.detail || `HTTP Error ${response.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (error: any) {
    if (error.message === 'Network request failed') {
      throw new Error(
        `Unable to reach backend server at ${baseUrl}. Ensure FastAPI is running on port 8000.`
      );
    }
    throw error;
  }
}
