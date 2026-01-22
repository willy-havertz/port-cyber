// Utility to fetch and parse RSS feeds in the browser
// Uses rss2json.com as a free proxy (no API key required for public feeds)
export async function fetchRssFeed(feedUrl) {
  const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}`;
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error("Failed to fetch RSS feed");
  const data = await res.json();
  return data.items.map((item) => ({
    id: item.guid || item.link,
    title: item.title,
    date: item.pubDate,
    author: item.author || item.creator || "Unknown",
    excerpt: item.description.replace(/<[^>]+>/g, "").slice(0, 160) + "...",
    content: item.content,
    coverImage: item.enclosure?.link || "",
    link: item.link,
  }));
}
