import type { LeadStatus } from "../constants";

export type MediaDTO = {
  id: number;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  alt: string;
  category: "FACADE" | "INTERIOR" | "CONSTRUCTION" | "PLAN" | "LOGO" | "OTHER";
  createdAt: string;
  usage: string[];
};

export type LeadDTO = {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  apartment: { id: number; number: number; label: string } | null;
  status: LeadStatus;
  source: string;
  country: string | null;
  createdAt: string;
};

export type Paginated<T> = { items: T[]; total: number; page: number; pageSize: number };

export type StatsDTO = {
  period: string;
  visitors: number;
  pageViews: number;
  leads: number;
  series: { bucket: string; visitors: number }[];
  countries: { country: string | null; visitors: number }[];
  pages: { path: string; views: number }[];
  devices: { device: string; visitors: number }[];
  sources: { source: string; visitors: number }[];
  recent: { id: string; createdAt: string; path: string; country: string | null; city: string | null; device: string; source: string }[];
};

export type UserDTO = { id: number; email: string; name: string; role: "ADMIN" | "EDITOR"; isActive: boolean; lastLoginAt: string | null };
