// src/types/index.ts
// Shared TypeScript interfaces matching backend DTOs

export interface User {
  userID: number;
  username: string;
}

export interface Question {
  questionID: number;
  text: string;
  isPredefined: boolean;
}

export interface Answer {
  answerID: number;
  questionID: number;
  userID: number;
  text: string;
  timestamp: string;
}

export interface Feeling {
  feelingID: number;
  userID: number;
  feeling: string;
  subject: string;
  context: string;
  timestamp: string;
}

export interface Photo {
  photoID: number;
  userID: number;
  imageURL: string;
  isSecure: boolean;
  timestamp: string;
}

export interface TimelineEntry {
  entryID: number;
  userID: number;
  title: string;
  content: string;
  timestamp: string;
}

export interface SurpriseDto {
  type: string;
  data: unknown;
}

export interface ApiError {
  message: string;
  status: number;
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Request shapes
export interface CreateAnswerRequest {
  questionID: number;
  userID: number;
  text: string;
}

export interface UpdateAnswerRequest {
  text: string;
}

export interface CreateFeelingRequest {
  userID: number;
  feeling: string;
  subject: string;
  context: string;
}

export interface CreateTimelineEntryRequest {
  userID: number;
  title: string;
  content?: string;
}
