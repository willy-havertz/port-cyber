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
  is_approved?: boolean;
  is_spam?: boolean;
  updated_at?: string;
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

// Admin API functions
export interface CreateWriteupPayload {
  title: string;
  platform: string;
  difficulty: string;
  category: string;
  date: string;
  time_spent: string;
  writeup_url: string;
  summary?: string;
}

export interface UpdateWriteupPayload {
  title?: string;
  platform?: string;
  difficulty?: string;
  category?: string;
  date?: string;
  time_spent?: string;
  writeup_url?: string;
  summary?: string;
}

export const uploadWriteupFile = async (
  payload: CreateWriteupPayload,
  file: File,
  onProgress?: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("platform", payload.platform);
  formData.append("difficulty", payload.difficulty);
  formData.append("category", payload.category);
  formData.append("date", payload.date);
  formData.append("time_spent", payload.time_spent);
  formData.append("summary", payload.summary || "");
  formData.append("tags", ""); // Backend auto-suggests tags from PDF
  formData.append("file", file);

  const { data } = await api.post("/writeups", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress) {
        const progress = Math.round(
          (event.loaded / (event.total || 1)) * 100
        );
        onProgress(progress);
      }
    },
  });
  return data as Writeup;
};

export const createWriteup = async (payload: CreateWriteupPayload) => {
  const { data } = await api.post("/writeups", payload);
  return data as Writeup;
};

export const updateWriteup = async (
  id: number,
  payload: UpdateWriteupPayload
) => {
  const { data } = await api.put(`/writeups/${id}`, payload);
  return data as Writeup;
};

export const deleteWriteup = async (id: number) => {
  await api.delete(`/writeups/${id}`);
};

export const getPendingComments = async () => {
  const { data } = await api.get("/comments/admin/pending");
  return data as Comment[];
};

export const approveComment = async (commentId: number) => {
  const { data } = await api.patch(`/comments/${commentId}`, {
    is_approved: true,
  });
  return data as Comment;
};

export const rejectComment = async (commentId: number) => {
  const { data } = await api.patch(`/comments/${commentId}`, {
    is_approved: false,
  });
  return data as Comment;
};

export const deleteComment = async (commentId: number) => {
  await api.delete(`/comments/${commentId}`);
};

export const loginAdmin = async (password: string) => {
  const { data } = await api.post("/auth/login", { password });
  localStorage.setItem("auth_token", data.access_token);
  return data;
};

export const logoutAdmin = () => {
  localStorage.removeItem("auth_token");
};

export default api;
