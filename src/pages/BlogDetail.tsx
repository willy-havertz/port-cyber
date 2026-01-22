import React from "react";
import { useParams, Link } from "react-router-dom";
import { blogPosts } from "../data/blogPosts";

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">
            Post Not Found
          </h1>
          <Link
            to="/blog"
            className="text-blue-600 dark:text-blue-400 underline"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors pt-20 pb-10">
      <div className="max-w-2xl mx-auto px-4">
        <img
          src={post.coverImage}
          alt={post.title}
          className="w-full h-64 object-cover rounded-xl mb-6"
        />
        <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">
          {post.title}
        </h1>
        <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {post.date} &bull; {post.author}
        </div>
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{
            __html: post.content.replace(/\n/g, "<br/>"),
          }}
        />
        <Link
          to="/blog"
          className="inline-block mt-8 text-blue-600 dark:text-blue-400 underline"
        >
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
}
