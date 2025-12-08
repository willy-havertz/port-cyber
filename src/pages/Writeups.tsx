import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WriteupCard from "../components/WriteupCard";
import FilterBar from "../components/FilterBar";
import { fetchWriteups, type Writeup } from "../lib/api";

interface UiWriteup {
  id: string;
  title: string;
  platform: "Hack The Box" | "Try Hack Me";
  difficulty: "Easy" | "Medium" | "Hard" | "Insane";
  category: string;
  date?: string;
  timeSpent?: string;
  writeupUrl?: string;
  tags: string[];
}

export default function Writeups() {
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
          tags: (w.tags || []).map((t) => t.name),
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
    [writeups]
  );
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    writeups.forEach((w) => {
      if (w.tags && Array.isArray(w.tags)) {
        w.tags.forEach((tag) => {
          if (tag && typeof tag === "string") {
            tags.add(tag);
          }
        });
      }
    });
    return Array.from(tags).sort();
  }, [writeups]);

  const filteredWriteups = useMemo(() => {
    return writeups.filter((writeup) => {
      const platformMatch =
        selectedPlatform === "All" || writeup.platform === selectedPlatform;
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(writeup.category);
      const tagMatch =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => writeup.tags.includes(tag));

      return platformMatch && categoryMatch && tagMatch;
    });
  }, [writeups, selectedPlatform, selectedCategories, selectedTags]);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleTagChange = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleReset = () => {
    setSelectedPlatform("All");
    setSelectedCategories([]);
    setSelectedTags([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header />

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              CTF Writeups
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Detailed reports and walkthroughs of Capture The Flag challenges
              from Hack The Box and Try Hack Me, documenting exploitation
              techniques, privilege escalation, and lessons learned.
            </p>
          </div>

          {/* Platform Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  onClick={() => setSelectedPlatform(platform)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedPlatform === platform
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          <FilterBar
            categories={allCategories}
            technologies={allTags}
            selectedCategories={selectedCategories}
            selectedTechnologies={selectedTags}
            onCategoryChange={handleCategoryChange}
            onTechnologyChange={handleTagChange}
            onReset={handleReset}
          />

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredWriteups.length > 0 ? (
                  filteredWriteups
                    .slice(0, visibleCount)
                    .map((writeup) => (
                      <WriteupCard
                        key={writeup.id}
                        {...writeup}
                        date={writeup.date || "Unknown"}
                        timeSpent={writeup.timeSpent || "Unknown"}
                        writeupUrl={writeup.writeupUrl || "#"}
                      />
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
                    className="px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium rounded-lg hover:bg-black dark:hover:bg-gray-100 transition-colors"
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
    </div>
  );
}
