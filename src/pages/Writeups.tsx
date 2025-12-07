import React, { useState, useMemo } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import WriteupCard from "../components/WriteupCard";
import FilterBar from "../components/FilterBar";

export default function Writeups() {
  const [selectedPlatform, setSelectedPlatform] = useState("All");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const writeups = [
    {
      id: "fowsniff",
      title: "Fowsniff - Linux Privilege Escalation via Misconfigured MOTD",
      platform: "Try Hack Me" as const,
      difficulty: "Easy" as const,
      category: "Linux",
      date: "Nov 20, 2025",
      timeSpent: "1hr 30min",
      writeupUrl: "/writeups/Fowsniff_ctf.pdf",
      tags: [
        "port scanning",
        "email service exploitation",
        "password cracking",
        "privilege escalation",
      ],
    },
    {
      id: "lame",
      title: "Lame - Classic Linux Privilege Escalation",
      platform: "Hack The Box" as const,
      difficulty: "Easy" as const,
      category: "Linux",
      date: "Jan 18, 2025",
      timeSpent: "1.5 hours",
      writeupUrl: "/writeups/lame.pdf",
      tags: ["linux", "samba", "exploit", "privesc"],
    },
    {
      id: "cybernetics",
      title: "Cybernetics - Advanced Web Exploitation",
      platform: "Hack The Box" as const,
      difficulty: "Hard" as const,
      category: "Web Security",
      date: "Jan 15, 2025",
      timeSpent: "8 hours",
      writeupUrl: "/writeups/cybernetics.pdf",
      tags: ["web", "sql-injection", "xxe", "deserialization"],
    },
    {
      id: "advent-day1",
      title: "Advent of Cyber - Day 1: Web Exploitation",
      platform: "Try Hack Me" as const,
      difficulty: "Easy" as const,
      category: "Web Security",
      date: "Dec 1, 2024",
      timeSpent: "45 minutes",
      writeupUrl: "/writeups/advent-day1.pdf",
      tags: ["web", "xss", "command-injection", "advent-of-cyber"],
    },
    {
      id: "advent-day7",
      title: "Advent of Cyber - Day 7: Cryptography Challenge",
      platform: "Try Hack Me" as const,
      difficulty: "Medium" as const,
      category: "Cryptography",
      date: "Dec 7, 2024",
      timeSpent: "1 hour",
      writeupUrl: "/writeups/advent-day7.pdf",
      tags: ["crypto", "rsa", "advent-of-cyber", "decryption"],
    },
    {
      id: "hackpark",
      title: "HackPark - Windows Exploitation Walkthrough",
      platform: "Try Hack Me" as const,
      difficulty: "Easy" as const,
      category: "Windows",
      date: "Nov 25, 2024",
      timeSpent: "1 hour",
      writeupUrl: "/writeups/hackpark.pdf",
      tags: ["windows", "web", "upload-vuln", "privesc"],
    },
    {
      id: "vulnnet-roasted",
      title: "VulnNet: Roasted - Advanced Linux Exploitation",
      platform: "Try Hack Me" as const,
      difficulty: "Hard" as const,
      category: "Linux",
      date: "Nov 20, 2024",
      timeSpent: "6 hours",
      writeupUrl: "/writeups/vulnnet-roasted.pdf",
      tags: ["linux", "web", "api", "privesc", "suid"],
    },
    {
      id: "resolute",
      title: "Resolute - Windows Domain Controller Attack",
      platform: "Hack The Box" as const,
      difficulty: "Medium" as const,
      category: "Active Directory",
      date: "Nov 15, 2024",
      timeSpent: "4 hours",
      writeupUrl: "/writeups/resolute.pdf",
      tags: ["windows", "domain-controller", "kerberos", "bloodhound"],
    },
    {
      id: "brainfuck",
      title: "Brainfuck - Binary Exploitation Challenge",
      platform: "Hack The Box" as const,
      difficulty: "Insane" as const,
      category: "Binary Exploitation",
      date: "Nov 10, 2024",
      timeSpent: "12 hours",
      writeupUrl: "/writeups/brainfuck.pdf",
      tags: ["binary", "pwn", "buffer-overflow", "rop"],
    },
  ];

  const platforms = ["All", "Hack The Box", "Try Hack Me"];

  // Extract unique categories and tags
  const allCategories = [...new Set(writeups.map((w) => w.category))];
  const allTags = [...new Set(writeups.flatMap((w) => w.tags))];

  // Filter logic
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
  }, [selectedPlatform, selectedCategories, selectedTags]);

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWriteups.length > 0 ? (
              filteredWriteups.map((writeup, index) => (
                <WriteupCard key={index} {...writeup} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  No writeups match your filters. Try adjusting your selection.
                </p>
              </div>
            )}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-12">
            <button className="px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium rounded-lg hover:bg-black dark:hover:bg-gray-100 transition-colors">
              Load More Writeups
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
