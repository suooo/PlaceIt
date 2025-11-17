import axios from 'axios';
import { USE_MOCK } from '@/config/env';
import { mockAdapter } from '@/mocks/server';

// const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const BASE = 'https://placeit-server-332546556871.asia-northeast1.run.app';

export const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // ← 쿠키 전송/수신
  adapter: USE_MOCK ? mockAdapter : undefined,
});

if (USE_MOCK) {
  // eslint-disable-next-line no-console
  console.info('[mock] NEXT_PUBLIC_USE_MOCK=true, axios mock adapter enabled');
}

// 요청에 accessToken 헤더 자동 첨부
api.interceptors.request.use(config => {
  const at =
    typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (at) config.headers.Authorization = `Bearer ${at}`;
  return config;
});

// 401 응답 시 자동 재발급
let refreshing = false;
let queue: Array<(t?: string) => void> = [];

api.interceptors.response.use(
  r => r,
  async error => {
    const { config, response } = error;
    if (response?.status !== 401 || config?.__retry) throw error;

    if (!refreshing) {
      refreshing = true;
      try {
        const { data } = await api.post('/auth/refresh'); // 쿠키 기반
        const newAT = data?.accessToken;
        if (newAT) localStorage.setItem('accessToken', newAT);
        queue.forEach(fn => fn(newAT));
      } catch (e) {
        queue.forEach(fn => fn(undefined));
        throw e;
      } finally {
        queue = [];
        refreshing = false;
      }
    }

    // 대기 후 재시도
    return new Promise((resolve, reject) => {
      queue.push((token?: string) => {
        if (!token) return reject(error);
        const retry = { ...config, __retry: true };
        retry.headers = {
          ...(retry.headers || {}),
          Authorization: `Bearer ${token}`,
        };
        resolve(api.request(retry));
      });
    });
  }
);
