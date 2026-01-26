import axios from "axios";

// Cache configuration
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();

const getCachedData = <T>(key: string): T | null => {
  // Try memory cache first
  if (cache.has(key)) {
    const entry = cache.get(key)!;
    if (Date.now() - entry.timestamp < CACHE_DURATION) {
      return entry.data;
    }
    cache.delete(key);
  }

  // Try localStorage
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const entry = JSON.parse(stored) as CacheEntry<T>;
      if (Date.now() - entry.timestamp < CACHE_DURATION) {
        // Restore to memory cache
        cache.set(key, entry);
        return entry.data;
      }
      localStorage.removeItem(key);
    }
  } catch {
    // Ignore cache read errors
  }

  return null;
};

const setCachedData = <T>(key: string, data: T): void => {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };

  // Store in both memory and localStorage
  cache.set(key, entry);
  try {
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // Ignore cache write errors
  }
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: false,
  timeout: 30000, // 30 second timeout for slower connections
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem("auth_token");
      if (
        window.location.pathname.startsWith("/admin") &&
        window.location.pathname !== "/admin/login"
      ) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

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
  writeup_content?: string;
  content_type?: "pdf" | "markdown";
  thumbnail_url?: string;
  tags?: { id: number; name: string }[];
  overview?: string;
  methodology?: string[];
  tools_used?: string[];
  key_findings?: string[];
  lessons_learned?: string[];
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
  reply_to_id?: number | null;
  replies?: Comment[];
}

export interface CreateCommentPayload {
  user_name: string;
  user_email: string;
  content: string;
}

export const fetchWriteups = async (opts?: { refresh?: boolean }) => {
  const cacheKey = "writeups_list";

  // Check cache first
  if (!opts?.refresh) {
    const cached = getCachedData<Writeup[]>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const maxRetries = 3;
  const retryDelay = 1000; // 1 second between retries

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Fetch from API
      const { data } = await api.get("/writeups", {
        params: { skip: 0, limit: 50 },
      });
      const writeups = data.items || data;

      // Cache the result
      setCachedData(cacheKey, writeups);

      return writeups;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(
          "Failed to fetch writeups after",
          maxRetries,
          "attempts:",
          error,
        );
        throw error;
      }
      console.warn(`Attempt ${attempt} failed, retrying in ${retryDelay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  return [];
};

export const fetchWriteup = async (
  id: string | number,
  opts?: { refresh?: boolean },
) => {
  const cacheKey = `writeup_${id}`;

  // Check cache first
  if (!opts?.refresh) {
    const cached = getCachedData<Writeup>(cacheKey);
    if (cached) {
      return cached;
    }
  }

  // Fetch from API
  const { data } = await api.get(`/writeups/${id}`);

  // Cache the result
  setCachedData(cacheKey, data);

  return data as Writeup;
};

export const fetchComments = async (writeupId: string | number) => {
  const cacheKey = `comments_${writeupId}`;

  // Check cache first
  const cached = getCachedData<Comment[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from API
  const { data } = await api.get(`/comments/${writeupId}`);

  // Cache the result
  setCachedData(cacheKey, data);

  return data as Comment[];
};

export const postComment = async (
  writeupId: string | number,
  payload: CreateCommentPayload,
) => {
  const { data } = await api.post("/comments/", {
    writeup_id: String(writeupId),
    ...payload,
  });
  return data;
};

export const replyToComment = async (
  commentId: number,
  payload: CreateCommentPayload & { writeup_id: string },
) => {
  const { data } = await api.post(`/comments/${commentId}/reply`, payload);
  return data as Comment;
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
  methodology?: string;
  tools_used?: string;
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
  methodology?: string;
  tools_used?: string;
}

export const uploadWriteupFile = async (
  payload: CreateWriteupPayload,
  file: File,
  onProgress?: (progress: number) => void,
) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("platform", payload.platform);
  formData.append("difficulty", payload.difficulty);
  formData.append("category", payload.category);
  formData.append("date", payload.date);
  formData.append("time_spent", payload.time_spent);
  formData.append("summary", payload.summary || "");
  if (payload.methodology) formData.append("methodology", payload.methodology);
  if (payload.tools_used) formData.append("tools_used", payload.tools_used);
  formData.append("tags", ""); // Backend auto-suggests tags from PDF
  formData.append("file", file);

  const { data } = await api.post("/writeups", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress) {
        const progress = Math.round((event.loaded / (event.total || 1)) * 100);
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
  payload: UpdateWriteupPayload,
) => {
  const { data } = await api.put(`/writeups/${id}`, payload);
  // Clear cache so polling fetches fresh data
  const cacheKey = `writeup_${id}`;
  cache.delete(cacheKey);
  try {
    localStorage.removeItem(cacheKey);
  } catch {
    // Ignore
  }
  // Also clear the writeups list cache
  const listKey = "writeups_list";
  cache.delete(listKey);
  try {
    localStorage.removeItem(listKey);
  } catch {
    // Ignore
  }
  return data as Writeup;
};

export const updateWriteupWithFile = async (
  id: number,
  payload: UpdateWriteupPayload,
  file: File,
  onProgress?: (progress: number) => void,
) => {
  const formData = new FormData();
  if (payload.title) formData.append("title", payload.title);
  if (payload.platform) formData.append("platform", payload.platform);
  if (payload.difficulty) formData.append("difficulty", payload.difficulty);
  if (payload.category) formData.append("category", payload.category);
  if (payload.date) formData.append("date", payload.date);
  if (payload.time_spent) formData.append("time_spent", payload.time_spent);
  if (payload.summary) formData.append("summary", payload.summary);
  if (payload.methodology) formData.append("methodology", payload.methodology);
  if (payload.tools_used) formData.append("tools_used", payload.tools_used);
  formData.append("file", file);

  const { data } = await api.put(`/writeups/${id}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (event) => {
      if (onProgress) {
        const progress = Math.round((event.loaded / (event.total || 1)) * 100);
        onProgress(progress);
      }
    },
  });
  // Clear cache so polling fetches fresh data
  const cacheKey = `writeup_${id}`;
  cache.delete(cacheKey);
  try {
    localStorage.removeItem(cacheKey);
  } catch {
    // Ignore
  }
  // Also clear the writeups list cache
  const listKey = "writeups_list";
  cache.delete(listKey);
  try {
    localStorage.removeItem(listKey);
  } catch {
    // Ignore
  }
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

export const generateAIContent = async (writeupId: number) => {
  const { data } = await api.post(`/writeups/${writeupId}/generate`);
  // Clear cache for this writeup
  const cacheKey = `writeup_${writeupId}`;
  cache.delete(cacheKey);
  try {
    localStorage.removeItem(cacheKey);
  } catch {
    // Ignore
  }
  return data as Writeup;
};

// Security tools
export interface AdvancedFinding {
  type: string;
  severity: string;
  description: string;
  [key: string]: any;
}

export interface AdvancedScanResponse {
  target: string;
  status: string;
  findings: AdvancedFinding[];
  metadata: Record<string, any>;
  timestamp: string;
}

export interface ApiAuditProbe {
  endpoint: string;
  method: string;
  url: string;
  status_code?: number;
  content_type?: string;
  allow_methods?: string;
  error?: string;
}

export interface ApiAuditResponse {
  target: string;
  probes: ApiAuditProbe[];
  findings: AdvancedFinding[];
  timestamp: string;
}

export interface CveSearchResultItem {
  id: string;
  description: string;
  published: string | null;
  modified: string | null;
  severity?: string | null;
  score?: number | null;
}

export interface CveSearchResponse {
  query: string;
  count: number;
  source?: string;
  results: CveSearchResultItem[];
  error?: string;
  timestamp: string;
}

export const runAdvancedScan = async (params: {
  target_url: string;
  include_port_scan?: boolean;
  scan_type?: "advanced" | "aggressive";
}) => {
  const { data } = await api.post("/scanner/advanced-scan", {
    scan_type: params.scan_type || "advanced",
    target_url: params.target_url,
    include_port_scan: params.include_port_scan ?? false,
  });
  return data as AdvancedScanResponse;
};

export const runApiAudit = async (payload: {
  base_url: string;
  endpoints?: { path: string; method?: string }[];
  include_options_probe?: boolean;
}) => {
  const { data } = await api.post("/scanner/api-audit", {
    base_url: payload.base_url,
    include_options_probe:
      payload.include_options_probe === undefined
        ? true
        : payload.include_options_probe,
    endpoints: (payload.endpoints || []).map((ep) => ({
      path: ep.path,
      method: (ep.method || "GET").toUpperCase(),
    })),
  });
  return data as ApiAuditResponse;
};

export const searchCVEs = async (query: string) => {
  const { data } = await api.get("/scanner/cve/search", {
    params: { q: query },
  });
  return data as CveSearchResponse;
};

export const loginAdmin = async (username: string, password: string) => {
  const { data } = await api.post("/auth/login", { username, password });
  localStorage.setItem("auth_token", data.access_token);
  return data;
};

export const logoutAdmin = () => {
  localStorage.removeItem("auth_token");
};

export default api;
