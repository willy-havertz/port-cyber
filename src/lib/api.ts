import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface Writeup {
  id: number;
  title: string;
  platform: string;
  difficulty: string;
  category: string;
  date?: string;
  time_spent?: string;
  summary?: string;
  writeup_url?: string;
  tags?: { id: number; name: string }[];
  overview?: string;
  methodology?: string[];
  keyFindings?: string[];
  toolsUsed?: string[];
  lessonsLearned?: string[];
}

export interface Comment {
  id: number;
  writeup_id: number;
  user_name: string;
  user_email: string;
  content: string;
  created_at: string;
}

export interface CreateCommentPayload {
  user_name: string;
  user_email: string;
  content: string;
}

export const fetchWriteups = async () => {
  const { data } = await api.get("/writeups", {
    params: { skip: 0, limit: 50 },
  });
  return data.items || data;
};

export const fetchWriteup = async (id: string | number) => {
  const { data } = await api.get(`/writeups/${id}`);
  return data as Writeup;
};

export const fetchComments = async (writeupId: string | number) => {
  const { data } = await api.get(`/comments/${writeupId}`);
  return data as Comment[];
};

export const postComment = async (
  writeupId: string | number,
  payload: CreateCommentPayload
) => {
  const { data } = await api.post("/comments/", {
    writeup_id: String(writeupId),
    ...payload,
  });
  return data;
};

export default api;
