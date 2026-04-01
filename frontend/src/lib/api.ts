// src/lib/api.ts
// Axios instance with typed API functions for all backend resources

import axios, { AxiosError, AxiosInstance } from 'axios';
import type {
  Question,
  Answer,
  Feeling,
  Photo,
  TimelineEntry,
  TimelinePagedResult,
  SurpriseDto,
  ApiError,
  CreateAnswerRequest,
  UpdateAnswerRequest,
  CreateFeelingRequest,
  CreateTimelineEntryRequest,
  PaginatedResponse,
} from '@/types/index';

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // required for HTTP-only JWT cookie
  timeout: 15000,
});

// Request interceptor — ensure Content-Type is set for non-multipart requests
api.interceptors.request.use((config) => {
  if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Response interceptor — normalize errors to ApiError shape
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message:
        (error.response?.data as { message?: string })?.message ??
        error.message ??
        'An unexpected error occurred.',
      status: error.response?.status ?? 0,
    };
    return Promise.reject(apiError);
  },
);

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export async function getQuestions(): Promise<Question[]> {
  const res = await api.get<Question[]>('/api/questions');
  return res.data;
}

export async function getQuestion(id: number): Promise<Question> {
  const res = await api.get<Question>(`/api/questions/${id}`);
  return res.data;
}

export async function getRandomQuestion(): Promise<Question> {
  const res = await api.get<Question>('/api/questions/random');
  return res.data;
}

export async function createQuestion(text: string, isPredefined: boolean): Promise<Question> {
  const res = await api.post<Question>('/api/questions', { text, isPredefined });
  return res.data;
}

export async function updateQuestion(id: number, text: string): Promise<Question> {
  const res = await api.put<Question>(`/api/questions/${id}`, { text });
  return res.data;
}

export async function deleteQuestion(id: number): Promise<void> {
  await api.delete(`/api/questions/${id}`);
}

// ---------------------------------------------------------------------------
// Answers
// ---------------------------------------------------------------------------

export async function getAnswers(questionId?: number): Promise<Answer[]> {
  const params = questionId !== undefined ? { questionId } : {};
  const res = await api.get<Answer[]>('/api/answers', { params });
  return res.data;
}

export async function createAnswer(data: CreateAnswerRequest): Promise<Answer> {
  const res = await api.post<Answer>('/api/answers', data);
  return res.data;
}

export async function updateAnswer(id: number, data: UpdateAnswerRequest): Promise<Answer> {
  const res = await api.put<Answer>(`/api/answers/${id}`, data);
  return res.data;
}

export async function deleteAnswer(id: number): Promise<void> {
  await api.delete(`/api/answers/${id}`);
}

// ---------------------------------------------------------------------------
// Feelings
// ---------------------------------------------------------------------------

export async function getFeelings(limit?: number): Promise<Feeling[]> {
  const params = limit !== undefined ? { limit } : {};
  const res = await api.get<Feeling[]>('/api/feelings', { params });
  return res.data;
}

export async function getAllFeelings(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<Feeling>> {
  const res = await api.get<PaginatedResponse<Feeling>>('/api/feelings/all', {
    params: { page, pageSize },
  });
  return res.data;
}

export async function getFeelingsCount(): Promise<number> {
  const res = await api.get<{ count: number }>('/api/feelings/count');
  return res.data.count;
}

export async function createFeeling(data: CreateFeelingRequest): Promise<Feeling> {
  const res = await api.post<Feeling>('/api/feelings', data);
  return res.data;
}

export async function deleteFeeling(id: number): Promise<void> {
  await api.delete(`/api/feelings/${id}`);
}

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

export async function getPhotos(secure?: boolean, page = 1, pageSize = 12): Promise<Photo[]> {
  const params: Record<string, unknown> = { page, pageSize };
  if (secure !== undefined) params.isSecure = secure;
  const res = await api.get<Photo[]>('/api/photos', { params });
  return res.data;
}

export async function uploadPhoto(formData: FormData): Promise<Photo> {
  const res = await api.post<Photo>('/api/photos/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deletePhoto(id: number): Promise<void> {
  await api.delete(`/api/photos/${id}`);
}

export async function togglePhotoSecure(id: number, isSecure: boolean): Promise<Photo> {
  const res = await api.patch<Photo>(`/api/photos/${id}/toggle-secure`, { isSecure });
  return res.data;
}

export async function getSecurePhotos(): Promise<Photo[]> {
  const res = await api.get<Photo[]>('/api/photos/secure');
  return res.data;
}

export async function logoutSecure(): Promise<void> {
  await api.post('/api/secure/logout');
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export async function getTimeline(cursor?: string): Promise<TimelinePagedResult> {
  const params = cursor ? { cursor, limit: 10 } : { limit: 10 };
  const res = await api.get<TimelinePagedResult>('/api/timeline', { params });
  return res.data;
}

export async function getTimelineEntry(id: number): Promise<TimelineEntry> {
  const res = await api.get<TimelineEntry>(`/api/timeline/${id}`);
  return res.data;
}

export async function createTimelineEntry(data: CreateTimelineEntryRequest): Promise<TimelineEntry> {
  const res = await api.post<TimelineEntry>('/api/timeline', data);
  return res.data;
}

export async function updateTimelineEntry(
  id: number,
  data: Partial<CreateTimelineEntryRequest>,
): Promise<TimelineEntry> {
  const res = await api.put<TimelineEntry>(`/api/timeline/${id}`, data);
  return res.data;
}

export async function deleteTimelineEntry(id: number): Promise<void> {
  await api.delete(`/api/timeline/${id}`);
}

// ---------------------------------------------------------------------------
// Surprise
// ---------------------------------------------------------------------------

export async function getSurpriseItem(): Promise<SurpriseDto> {
  const res = await api.get<SurpriseDto>('/api/surprise');
  return res.data;
}

// ---------------------------------------------------------------------------
// Auth — Secure Section
// ---------------------------------------------------------------------------

export async function verifySecurePassword(password: string): Promise<{ token: string; expiresAt: string }> {
  const res = await api.post<{ token: string; expiresAt: string }>('/api/secure/verify', {
    password,
  });
  return res.data;
}

// ---------------------------------------------------------------------------
// Auth — Admin
// ---------------------------------------------------------------------------

export async function verifyAdminPassword(password: string): Promise<{ token: string; expiresAt: string }> {
  const res = await api.post<{ token: string; expiresAt: string }>('/api/admin/verify', {
    password,
  });
  return res.data;
}

export async function adminLogout(): Promise<void> {
  await api.post('/api/admin/logout');
}

export interface AdminStats {
  questionCount: number;
  answerCount: number;
  feelingCount: number;
  photoCount: number;
  timelineCount: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const res = await api.get<AdminStats>('/api/admin/stats');
  return res.data;
}

export interface ActivityLog {
  logID: number;
  ipAddress: string;
  page: string;
  action: string;
  timestamp: string;
}

export async function getActivityLogs(
  page = 1,
  pageSize = 20,
): Promise<PaginatedResponse<ActivityLog>> {
  const res = await api.get<PaginatedResponse<ActivityLog>>('/api/admin/activity-logs', {
    params: { page, pageSize },
  });
  return res.data;
}

export default api;
