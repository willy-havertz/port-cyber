import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ExternalLink, Calendar, User, Filter, X } from "lucide-react";
import { useTheme } from "../contexts/useTheme";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { fetchRssFeed } from "../lib/rss";

interface RssPost {
  id: string;
  title: string;
  date: string;
  author: string;
  excerpt: string;
  content: string;
  coverImage: string;
  link: string;
  source?: string;
}

// Source configuration with colors and names
const SOURCES: Record<
  string,
  { name: string; color: string; textColor: string }
> = {
  "thehackernews.com": {
    name: "The Hacker News",
    color: "bg-red-500",
    textColor: "text-red-500",
  },
  "bleepingcomputer.com": {
    name: "BleepingComputer",
    color: "bg-orange-500",
    textColor: "text-orange-500",
  },
  "krebsonsecurity.com": {
    name: "Krebs on Security",
    color: "bg-purple-500",
    textColor: "text-purple-500",
  },
  "darkreading.com": {
    name: "Dark Reading",
    color: "bg-blue-500",
    textColor: "text-blue-500",
  },
};

// Cybersecurity-themed images that clearly represent each topic
// Using high-quality, relevant images that are visible and distinctive
const imagesByTopic: Record<string, string[]> = {
  ransomware: [
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80", // Lock on laptop
    "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80", // Cyber lock
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80", // Code screen
  ],
  phishing: [
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80", // Matrix code
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", // Cyber security
    "https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=800&q=80", // Phishing hook
  ],
  malware: [
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80", // Matrix
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", // Server room
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80", // Code
  ],
  vulnerability: [
    "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80", // Programming
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80", // Tech
    "https://images.unsplash.com/photo-1603899122634-f086ca5f5ddd?auto=format&fit=crop&w=800&q=80", // Bug
  ],
  breach: [
    "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=800&q=80", // Building
    "https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=800&q=80", // Hacker
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80", // Data
  ],
  hacker: [
    "https://images.unsplash.com/photo-1551808525-51a94da548ce?auto=format&fit=crop&w=800&q=80", // Hooded hacker
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80", // Matrix
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80", // Code
  ],
  password: [
    "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=800&q=80", // Lock
    "https://images.unsplash.com/photo-1633265486064-086b219458ec?auto=format&fit=crop&w=800&q=80", // Security
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=80", // Laptop lock
  ],
  encryption: [
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", // Server
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80", // Matrix
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=800&q=80", // Code
  ],
  network: [
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", // Server room
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80", // Network cables
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // Globe network
  ],
  cloud: [
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80", // Cloud
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80", // Globe
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", // Server
  ],
  ai: [
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80", // AI brain
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80", // Robot
    "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=800&q=80", // Tech
  ],
  government: [
    "https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&w=800&q=80", // Government building
    "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=800&q=80", // Office building
    "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80", // Capitol
  ],
  generic: [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", // Cyber security shield
    "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&w=800&q=80", // Code on screen
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", // Data center
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80", // Matrix code
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80", // Security
  ],
};

// Track used images to avoid duplicates across articles
const usedImageUrls = new Set<string>();

// Get source from URL
function getSourceFromLink(link: string): string {
  try {
    const url = new URL(link);
    const hostname = url.hostname.replace("www.", "");
    return hostname;
  } catch {
    return "unknown";
  }
}

// Get topic-based image that represents the content
function getTopicImage(title: string, excerpt: string): string {
  const text = (title + " " + excerpt).toLowerCase();

  // Determine the best topic based on content
  let topic = "generic";

  if (text.includes("ransomware") || text.includes("ransom")) {
    topic = "ransomware";
  } else if (
    text.includes("phishing") ||
    text.includes("scam") ||
    text.includes("fraud")
  ) {
    topic = "phishing";
  } else if (
    text.includes("malware") ||
    text.includes("virus") ||
    text.includes("trojan") ||
    text.includes("botnet")
  ) {
    topic = "malware";
  } else if (
    text.includes("vulnerability") ||
    text.includes("cve") ||
    text.includes("zero-day") ||
    text.includes("exploit") ||
    text.includes("patch")
  ) {
    topic = "vulnerability";
  } else if (
    text.includes("breach") ||
    text.includes("leak") ||
    text.includes("stolen") ||
    text.includes("exposed")
  ) {
    topic = "breach";
  } else if (
    text.includes("hacker") ||
    text.includes("attack") ||
    text.includes("apt") ||
    text.includes("threat actor")
  ) {
    topic = "hacker";
  } else if (
    text.includes("password") ||
    text.includes("credential") ||
    text.includes("authentication") ||
    text.includes("2fa") ||
    text.includes("mfa")
  ) {
    topic = "password";
  } else if (
    text.includes("encrypt") ||
    text.includes("crypto") ||
    text.includes("ssl") ||
    text.includes("tls")
  ) {
    topic = "encryption";
  } else if (
    text.includes("network") ||
    text.includes("firewall") ||
    text.includes("vpn") ||
    text.includes("router")
  ) {
    topic = "network";
  } else if (
    text.includes("cloud") ||
    text.includes("aws") ||
    text.includes("azure") ||
    text.includes("saas")
  ) {
    topic = "cloud";
  } else if (
    text.includes("ai") ||
    text.includes("artificial intelligence") ||
    text.includes("machine learning") ||
    text.includes("chatgpt") ||
    text.includes("llm")
  ) {
    topic = "ai";
  } else if (
    text.includes("government") ||
    text.includes("fbi") ||
    text.includes("cisa") ||
    text.includes("nsa") ||
    text.includes("federal") ||
    text.includes("state-sponsored")
  ) {
    topic = "government";
  }

  const pool = imagesByTopic[topic] || imagesByTopic.generic;

  // Find an unused image from the pool
  for (const img of pool) {
    if (!usedImageUrls.has(img)) {
      usedImageUrls.add(img);
      return img;
    }
  }

  // If all images in topic are used, try generic pool
  for (const img of imagesByTopic.generic) {
    if (!usedImageUrls.has(img)) {
      usedImageUrls.add(img);
      return img;
    }
  }

  // If everything is used, just return a random one from the topic
  return pool[Math.floor(Math.random() * pool.length)];
}

// Loading skeleton component
function SkeletonCard({ theme }: { theme: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border ${
        theme === "dark"
          ? "bg-slate-900/50 border-slate-800"
          : "bg-white border-gray-200"
      }`}
    >
      <div
        className={`w-full h-48 animate-pulse ${theme === "dark" ? "bg-slate-800" : "bg-gray-200"}`}
      />
      <div className="p-6 space-y-3">
        <div
          className={`h-4 w-20 rounded animate-pulse ${theme === "dark" ? "bg-slate-800" : "bg-gray-200"}`}
        />
        <div
          className={`h-6 w-full rounded animate-pulse ${theme === "dark" ? "bg-slate-800" : "bg-gray-200"}`}
        />
        <div
          className={`h-4 w-3/4 rounded animate-pulse ${theme === "dark" ? "bg-slate-800" : "bg-gray-200"}`}
        />
        <div
          className={`h-4 w-1/2 rounded animate-pulse ${theme === "dark" ? "bg-slate-800" : "bg-gray-200"}`}
        />
      </div>
    </div>
  );
}

// Format date nicely
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function Blog() {
  const { theme } = useTheme();
  const [rssPosts, setRssPosts] = useState<RssPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const FEEDS = [
    "https://feeds.feedburner.com/TheHackersNews",
    "https://www.bleepingcomputer.com/feed/",
    "https://krebsonsecurity.com/feed/",
    "https://www.darkreading.com/rss.xml",
  ];

  useEffect(() => {
    Promise.all(FEEDS.map((feed) => fetchRssFeed(feed).catch(() => [])))
      .then((results) => {
        const allPosts = results
          .flat()
          .map((post) => ({
            ...post,
            source: getSourceFromLink(post.link),
            coverImage:
              post.coverImage || getTopicImage(post.title, post.excerpt),
          }))
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        setRssPosts(allPosts);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load news feeds.");
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter posts based on search and source
  const filteredPosts = useMemo(() => {
    return rssPosts.filter((post) => {
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSource = !selectedSource || post.source === selectedSource;
      return matchesSearch && matchesSource;
    });
  }, [rssPosts, searchQuery, selectedSource]);

  // Get unique sources from posts
  const availableSources = useMemo(() => {
    const sources = new Set(rssPosts.map((post) => post.source));
    return Array.from(sources).filter((s) => s && SOURCES[s]);
  }, [rssPosts]);

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <Header />

      <main className="pt-32 pb-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1
              className={`text-4xl md:text-5xl font-bold mb-4 ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Cybersecurity{" "}
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                News
              </span>
            </h1>
            <p
              className={`text-lg max-w-2xl mx-auto ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Stay updated with the latest cybersecurity news, threats, and
              vulnerabilities from trusted sources
            </p>
          </motion.div>

          {/* Search and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search
                  className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                    theme === "dark" ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all ${
                    theme === "dark"
                      ? "bg-slate-900/50 border-slate-700 text-white placeholder-gray-500 focus:border-green-500"
                      : "bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-green-500"
                  } focus:outline-none focus:ring-2 focus:ring-green-500/20`}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                      theme === "dark"
                        ? "text-gray-500 hover:text-gray-300"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  theme === "dark"
                    ? "bg-slate-900/50 border-slate-700 text-gray-300 hover:border-green-500"
                    : "bg-white border-gray-200 text-gray-700 hover:border-green-500"
                } ${selectedSource ? "border-green-500 ring-2 ring-green-500/20" : ""}`}
              >
                <Filter className="w-5 h-5" />
                <span>Filter by Source</span>
                {selectedSource && (
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-500">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* Source Filter Pills */}
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-wrap gap-2"
              >
                <button
                  onClick={() => setSelectedSource(null)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    !selectedSource
                      ? "bg-green-500 text-white"
                      : theme === "dark"
                        ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  All Sources
                </button>
                {availableSources.map((source) => {
                  if (!source) return null;
                  const sourceInfo = SOURCES[source];
                  if (!sourceInfo) return null;
                  return (
                    <button
                      key={source}
                      onClick={() =>
                        setSelectedSource(
                          selectedSource === source ? null : source,
                        )
                      }
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedSource === source
                          ? `${sourceInfo.color} text-white`
                          : theme === "dark"
                            ? "bg-slate-800 text-gray-300 hover:bg-slate-700"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {sourceInfo.name}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </motion.div>

          {/* Results Count */}
          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {filteredPosts.length}{" "}
              {filteredPosts.length === 1 ? "article" : "articles"} found
              {selectedSource &&
                SOURCES[selectedSource] &&
                ` from ${SOURCES[selectedSource].name}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </motion.p>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading Skeletons */}
          {loading && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} theme={theme} />
              ))}
            </div>
          )}

          {/* News Grid */}
          {!loading && !error && (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.map((post, index) => {
                const sourceInfo = SOURCES[post.source as string];
                return (
                  <motion.a
                    href={post.link}
                    key={post.id}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className={`group block rounded-2xl overflow-hidden border transition-all duration-300 hover:scale-[1.02] ${
                      theme === "dark"
                        ? "bg-slate-900/50 border-slate-800 hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/10"
                        : "bg-white border-gray-200 hover:border-green-500/50 hover:shadow-xl"
                    }`}
                  >
                    {/* Image - Made taller for better visibility */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to a default cybersecurity image if loading fails
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80";
                        }}
                      />
                      {/* Lighter gradient overlay for better image visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Source Badge */}
                      {sourceInfo && (
                        <div
                          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${sourceInfo.color} shadow-lg`}
                        >
                          {sourceInfo.name}
                        </div>
                      )}

                      {/* External Link Icon */}
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h2
                        className={`text-lg font-semibold mb-2 line-clamp-2 group-hover:text-green-500 transition-colors ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {post.title}
                      </h2>
                      <p
                        className={`text-sm mb-4 line-clamp-2 ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {post.excerpt}
                      </p>

                      {/* Meta Info */}
                      <div
                        className={`flex items-center gap-4 text-xs ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}
                      >
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(post.date)}
                        </span>
                        {post.author && post.author !== "Unknown" && (
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {post.author}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredPosts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-gray-500/10 flex items-center justify-center mx-auto mb-4">
                <Search
                  className={`w-8 h-8 ${theme === "dark" ? "text-gray-600" : "text-gray-400"}`}
                />
              </div>
              <h3
                className={`text-xl font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}
              >
                No articles found
              </h3>
              <p
                className={`mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
              >
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSource(null);
                }}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
