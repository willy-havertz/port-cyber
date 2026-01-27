import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WriteupCard from "../components/WriteupCard";
import FilterBar from "../components/FilterBar";
import { fetchWriteups, type Writeup } from "../lib/api";
import { useTheme } from "../contexts/useTheme";

interface UiWriteup {
  id: string;
  title: string;
  platform: "Hack The Box" | "Try Hack Me";
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  category: string;
  date?: string;
  timeSpent?: string;
  writeupUrl?: string;
  thumbnailUrl?: string;
  summary?: string;
  tags: string[];
  tools_used?: string[];
}

export default function Writeups() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(6);
  const [writeups, setWriteups] = useState<UiWriteup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data: Writeup[] = await fetchWriteups();
        const normalized = data.map((w) => ({
          id: String(w.id),
          title: w.title,
          platform: w.platform as "Hack The Box" | "Try Hack Me",
          difficulty: w.difficulty as "Easy" | "Medium" | "Hard" | "Insane",
          category: w.category,
          date: w.date,
          timeSpent: w.time_spent,
          writeupUrl: w.writeup_url,
          thumbnailUrl: w.thumbnail_url,
          summary: w.summary,
          tags: (w.tags || []).map((t) => t.name),
          tools_used: w.tools_used,
        }));
        setWriteups(normalized);
      } catch (err) {
        console.error(err);
        setError("Failed to load writeups");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const platforms = ["All", "Hack The Box", "Try Hack Me"];

  const allCategories = useMemo(
    () => [...new Set(writeups.map((w) => w.category).filter(Boolean))].sort(),
    [writeups],
  );

  const filteredWriteups = useMemo(() => {
    return writeups.filter((writeup) => {
      const searchMatch =
        searchQuery === "" ||
        writeup.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (writeup.summary &&
          writeup.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
        writeup.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      const platformMatch =
        selectedPlatform === "All" || writeup.platform === selectedPlatform;
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(writeup.category);
      const tagMatch =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => writeup.tags.includes(tag));

      return searchMatch && platformMatch && categoryMatch && tagMatch;
    });
  }, [
    writeups,
    searchQuery,
    selectedPlatform,
    selectedCategories,
    selectedTags,
  ]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedPlatform("All");
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      }`}
    >
      <Header />

      <main className="py-12 pt-32 md:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span
                className={theme === "dark" ? "text-white" : "text-gray-900"}
              >
                CTF{" "}
              </span>
              <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Writeups
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Detailed reports and walkthroughs of Capture The Flag challenges
              from Hack The Box and Try Hack Me, documenting exploitation
              techniques, privilege escalation, and lessons learned.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mb-8"
          >
            <div className="relative w-full md:w-96 mx-auto">
              <Search
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  theme === "dark" ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                placeholder="Search writeups..."
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
          </motion.div>

          {/* Platform Filter */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap gap-2 justify-center">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedPlatform === platform
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                      : theme === "dark"
                        ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        : "bg-white text-slate-700 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Advanced Filters */}
          <FilterBar
            categories={allCategories}
            selectedCategories={selectedCategories}
            onCategoryChange={handleCategoryChange}
            onReset={handleReset}
          />

          {/* Results Count */}
          {!loading && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mb-6 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}
            >
              {filteredWriteups.length}{" "}
              {filteredWriteups.length === 1 ? "writeup" : "writeups"} found
              {selectedPlatform !== "All" && ` from ${selectedPlatform}`}
              {selectedCategories.length > 0 &&
                ` in ${selectedCategories.join(", ")}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </motion.p>
          )}

          {loading ? (
            <div className="text-center py-12 text-slate-600 dark:text-slate-400">
              Loading writeups...
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredWriteups.length > 0 ? (
                  filteredWriteups
                    .slice(0, visibleCount)
                    .map((writeup, index) => (
                      <motion.div
                        key={writeup.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <WriteupCard
                          {...writeup}
                          date={writeup.date || "Unknown"}
                          timeSpent={writeup.timeSpent || "Unknown"}
                          writeupUrl={writeup.writeupUrl || "#"}
                          thumbnailUrl={writeup.thumbnailUrl}
                          summary={writeup.summary}
                        />
                      </motion.div>
                    ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                      No writeups match your filters. Try adjusting your
                      selection.
                    </p>
                  </div>
                )}
              </div>

              {visibleCount < filteredWriteups.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setVisibleCount(visibleCount + 6)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-green-500/25"
                  >
                    Load More Writeups
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
