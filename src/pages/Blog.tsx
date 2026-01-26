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
  "securityweek.com": {
    name: "SecurityWeek",
    color: "bg-blue-500",
    textColor: "text-blue-500",
  },
};

// Image pools for each topic
const pools: Record<string, string[]> = {
  ransomware: [
    "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80",
  ],
  phishing: [
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
  ],
  malware: [
    "https://images.unsplash.com/photo-1463438690606-f6778b8c1d10?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
  ],
  encryption: [
    "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    "https://cdn.pixabay.com/photo/2017/01/10/19/05/abstract-1975041_1280.jpg",
  ],
  hacker: [
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    "https://cdn.pixabay.com/photo/2017/01/10/19/05/abstract-1975041_1280.jpg",
  ],
  generic: [
    "https://cdn.pixabay.com/photo/2017/01/10/19/05/abstract-1975041_1280.jpg",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
  ],
};

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

// Get topic-based image
function getTopicImage(title: string, excerpt: string): string {
  const text = (title + " " + excerpt).toLowerCase();
  if (text.includes("ransomware"))
    return pools.ransomware[
      Math.floor(Math.random() * pools.ransomware.length)
    ];
  if (text.includes("phishing"))
    return pools.phishing[Math.floor(Math.random() * pools.phishing.length)];
  if (text.includes("malware"))
    return pools.malware[Math.floor(Math.random() * pools.malware.length)];
  if (text.includes("encryption") || text.includes("crypto"))
    return pools.encryption[
      Math.floor(Math.random() * pools.encryption.length)
    ];
  if (
    text.includes("hacker") ||
    text.includes("breach") ||
    text.includes("attack")
  )
    return pools.hacker[Math.floor(Math.random() * pools.hacker.length)];
  return pools.generic[Math.floor(Math.random() * pools.generic.length)];
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
    "https://www.securityweek.com/feed/",
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
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Source Badge */}
                      {sourceInfo && (
                        <div
                          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold text-white ${sourceInfo.color}`}
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
