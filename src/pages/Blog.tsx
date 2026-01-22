import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
import { fetchRssFeed } from "../lib/rss";

export default function Blog() {
  // Image pools for each topic
  const pools = {
    ransomware: [
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    ],
    phishing: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    ],
    malware: [
      "https://images.unsplash.com/photo-1463438690606-f6778b8c1d10?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80",
    ],
    encryption: [
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
      "https://cdn.pixabay.com/photo/2017/01/10/19/05/abstract-1975041_1280.jpg",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    ],
    firewall: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1463438690606-f6778b8c1d10?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
    ],
    zeroday: [
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
    ],
    socialengineering: [
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80",
      "https://cdn.pixabay.com/photo/2017/01/10/19/05/abstract-1975041_1280.jpg",
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
    ],
    vpn: [
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
    ],
    wifi: [
      "https://images.unsplash.com/photo-1463438690606-f6778b8c1d10?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    ],
    scam: [
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
    ],
    hacker: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      "https://cdn.pixabay.com/photo/2017/01/10/19/05/abstract-1975041_1280.jpg",
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
    ],
    password: [
      "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    ],
    data: [
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
      "https://cdn.pixabay.com/photo/2017/01/10/19/05/abstract-1975041_1280.jpg",
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
    ],
    generic: [
      "https://cdn.pixabay.com/photo/2017/01/10/19/05/abstract-1975041_1280.jpg",
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508780709619-79562169bc64?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=800&q=80",
    ],
  };
  // Track used images to avoid duplicates
  const usedImages = new Set();
  function pick(pool) {
    const available = pool.filter((img) => !usedImages.has(img));
    let chosen;
    if (available.length > 0) {
      chosen = available[Math.floor(Math.random() * available.length)];
    } else {
      // If all images used, allow repeats
      chosen = pool[Math.floor(Math.random() * pool.length)];
    }
    usedImages.add(chosen);
    return chosen;
  }
  const [rssPosts, setRssPosts] = useState<
    Array<{
      id: string;
      title: string;
      date: string;
      author: string;
      excerpt: string;
      content: string;
      coverImage: string;
      link: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Multiple cybersecurity RSS feeds (outside component to avoid useEffect dependency warning)
  const FEEDS = [
    "https://feeds.feedburner.com/TheHackersNews",
    "https://www.bleepingcomputer.com/feed/",
    "https://krebsonsecurity.com/feed/",
    "https://www.securityweek.com/feed/",
  ];

  useEffect(() => {
    Promise.all(FEEDS.map((feed) => fetchRssFeed(feed).catch(() => [])))
      .then((results) => {
        // Flatten and sort all posts by date descending
        const allPosts = results
          .flat()
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
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors pt-20 pb-10">
      <h1 className="text-4xl font-bold mb-8 text-slate-900 dark:text-white px-4">
        Cybersecurity News
      </h1>
      {loading && (
        <div className="text-slate-600 dark:text-slate-300 px-4">
          Loading news...
        </div>
      )}
      {error && <div className="text-red-500 mb-4 px-4">{error}</div>}
      <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full px-4 md:px-8">
        {rssPosts.map((post) => {
          let image = post.coverImage;
          if (!image) {
            const text = (post.title + " " + post.excerpt).toLowerCase();
            if (text.includes("ransomware")) {
              image = pick(pools.ransomware);
            } else if (text.includes("phishing")) {
              image = pick(pools.phishing);
            } else if (text.includes("malware")) {
              image = pick(pools.malware);
            } else if (text.includes("encryption")) {
              image = pick(pools.encryption);
            } else if (text.includes("firewall")) {
              image = pick(pools.firewall);
            } else if (text.includes("zero-day")) {
              image = pick(pools.zeroday);
            } else if (text.includes("social engineering")) {
              image = pick(pools.socialengineering);
            } else if (text.includes("vpn")) {
              image = pick(pools.vpn);
            } else if (text.includes("wi-fi")) {
              image = pick(pools.wifi);
            } else if (text.includes("scam")) {
              image = pick(pools.scam);
            } else if (
              text.includes("hacker") ||
              text.includes("breach") ||
              text.includes("attack") ||
              text.includes("cyber")
            ) {
              image = pick(pools.hacker);
            } else if (
              text.includes("password") ||
              text.includes("credential")
            ) {
              image = pick(pools.password);
            } else if (text.includes("data")) {
              image = pick(pools.data);
            } else {
              image = pick(pools.generic);
            }
          }
          return (
            <a
              href={post.link}
              key={post.id}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden shadow-lg bg-white dark:bg-slate-800 hover:shadow-2xl transition-shadow border border-slate-200 dark:border-slate-700"
            >
              <img
                src={image}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-1 text-slate-900 dark:text-white">
                  {post.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-2">
                  {post.excerpt}
                </p>
                <div className="text-xs text-slate-400 mb-1">
                  {post.date} &bull; {post.author}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
