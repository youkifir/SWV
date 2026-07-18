// Типы, отражающие таблицы из supabase/schema.sql

export type Season = {
  id: string;
  label: string;
  is_current: boolean;
  voting_deadline: string | null;
  results_published: boolean;
};

export type Nomination = {
  id: string;
  season_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Nominee = {
  id: string;
  nomination_id: string;
  name: string;
  avatar_url: string | null;
  sort_order: number;
};

export type VoterCode = {
  id: string;
  season_id: string;
  code: string;
  label: string | null;
  is_used: boolean;
  used_at: string | null;
};

export type Vote = {
  id: string;
  code_id: string;
  nomination_id: string;
  nominee_id: string;
};

export type NominationResult = {
  nomination: Nomination;
  standings: { nominee: Nominee; voteCount: number }[]; // отсортировано по убыванию, топ-3
};

export type ContentStatus = 'published' | 'pending' | 'rejected';

export type Member = {
  id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  status: ContentStatus;
};

export type IcebergEntry = {
  id: string;
  level: number;
  title: string;
  description: string | null;
  status: ContentStatus;
};

export type HistoryEvent = {
  id: string;
  event_date: string;
  title: string;
  description: string | null;
  image_url: string | null;
  status: ContentStatus;
};

export type Meme = {
  id: string;
  image_url: string;
  caption: string | null;
  status: ContentStatus;
};

export type SubmissionType = 'member' | 'iceberg' | 'history' | 'meme';

export type Submission = {
  id: string;
  type: SubmissionType;
  target_id: string | null;
  payload: Record<string, unknown>;
  submitter_name: string | null;
  status: ContentStatus;
  created_at: string;
};
