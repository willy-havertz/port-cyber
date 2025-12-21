import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, AlertCircle, X, Sparkles } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import {
  fetchWriteups,
  deleteWriteup,
  createWriteup,
  updateWriteup,
  uploadWriteupFile,
  updateWriteupWithFile,
  generateAIContent,
  type Writeup,
  type CreateWriteupPayload,
  type UpdateWriteupPayload,
} from "../../lib/api";

export default function AdminWriteups() {
  const [writeups, setWriteups] = useState<Writeup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateWriteupPayload>({
    title: "",
    platform: "Hack The Box",
    difficulty: "Easy",
    category: "Web Security",
    date: new Date().toISOString().split("T")[0],
    time_spent: "1 hour",
    writeup_url: "/writeups/",
    summary: "",
    tools_used: "",
  });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchWriteups();
      setWriteups(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load writeups");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate file if selected
    if (selectedFile) {
      const isValidFile =
        selectedFile.name.endsWith(".pdf") ||
        selectedFile.name.endsWith(".zip");
      if (!isValidFile) {
        setError("Only PDF or ZIP files are allowed");
        return;
      }
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB");
        return;
      }
    }

    try {
      setError(null);
      setSuccess(null);
      setIsUploading(true);

      if (editingId) {
        // Update existing writeup - optimistic update
        const updatedWriteup: Writeup = {
          ...writeups.find((w) => w.id === editingId)!,
          ...formData,
        };

        // Update UI immediately (optimistic)
        setWriteups((prev) =>
          prev.map((w) => (w.id === editingId ? updatedWriteup : w))
        );

        try {
          if (selectedFile) {
            // Update with new file
            await updateWriteupWithFile(
              editingId,
              formData,
              selectedFile,
              (progress) => {
                setUploadProgress(progress);
              }
            );
            setSuccess("Writeup updated and file uploaded successfully!");
          } else {
            // Update without file
            const payload: UpdateWriteupPayload = formData;
            const response = await updateWriteup(editingId, payload);
            // Replace optimistic update with real data from backend
            setWriteups((prev) =>
              prev.map((w) => (w.id === editingId ? response : w))
            );
            setSuccess("Writeup updated successfully!");
          }
        } catch (err: any) {
          console.error(err);
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Failed to update writeup"
          );
          // Reload to revert optimistic update on error
          await load();
        }
      } else if (selectedFile) {
        // Create with file
        const newWriteup = await uploadWriteupFile(
          formData,
          selectedFile,
          (progress) => {
            setUploadProgress(progress);
          }
        );
        // Add new writeup to list immediately
        setWriteups((prev) => [newWriteup, ...prev]);
        setSuccess("Writeup created and file uploaded successfully!");
      } else {
        // Create without file (manual URL entry)
        const newWriteup = await createWriteup(formData);
        // Add new writeup to list immediately
        setWriteups((prev) => [newWriteup, ...prev]);
        setSuccess("Writeup created successfully!");
      }

      resetForm();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
      } else {
        setError(
          err.response?.data?.detail || err.message || "Failed to save writeup"
        );
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      platform: "Hack The Box",
      difficulty: "Easy",
      category: "Web Security",
      date: new Date().toISOString().split("T")[0],
      time_spent: "1 hour",
      writeup_url: "/writeups/",
      summary: "",
      tools_used: "",
    });
    setSelectedFile(null);
    setUploadProgress(0);
    setShowForm(false);
    setEditingId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isValidFile =
        file.name.endsWith(".pdf") || file.name.endsWith(".zip");
      if (!isValidFile) {
        setError("Only PDF or ZIP files are allowed");
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setError("File size must be less than 50MB");
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleEdit = (writeup: Writeup) => {
    setFormData({
      title: writeup.title,
      platform: writeup.platform,
      difficulty: writeup.difficulty,
      category: writeup.category,
      date: writeup.date || "",
      time_spent: writeup.time_spent || "",
      writeup_url: writeup.writeup_url || "",
      summary: writeup.summary || "",
      tools_used: writeup.tools_used ? (Array.isArray(writeup.tools_used) ? writeup.tools_used.join(", ") : writeup.tools_used) : "",
    });
    setEditingId(writeup.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this writeup?"))
      return;

    try {
      setError(null);
      await deleteWriteup(id);
      setSuccess("Writeup deleted successfully!");
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to delete writeup");
    }
  };

  const handleGenerateAI = async (id: number) => {
    if (
      !window.confirm(
        "Generate AI content for this writeup? This may take a few seconds."
      )
    )
      return;

    try {
      setError(null);
      setGeneratingAI(id);
      const updatedWriteup = await generateAIContent(id);
      // Update UI immediately with generated content
      setWriteups((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updatedWriteup } : w))
      );
      setSuccess("AI content generated successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to generate AI content");
      // Reload to get fresh data on error
      await load();
    } finally {
      setGeneratingAI(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Manage Writeups
          </h1>
          {!showForm && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-black dark:bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              New Writeup
            </motion.button>
          )}
        </div>

        {/* Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg"
          >
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
          >
            <p className="text-green-600 dark:text-green-400">{success}</p>
          </motion.div>
        )}

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 sm:p-6"
          >
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-4">
              {editingId ? "Edit Writeup" : "Create New Writeup"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
                <select
                  value={formData.platform}
                  onChange={(e) =>
                    setFormData({ ...formData, platform: e.target.value })
                  }
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option>Hack The Box</option>
                  <option>Try Hack Me</option>
                </select>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({ ...formData, difficulty: e.target.value })
                  }
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                  <option>Insane</option>
                </select>
                <input
                  type="text"
                  placeholder="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  required
                />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Time spent (e.g., 1 hour)"
                  value={formData.time_spent}
                  onChange={(e) =>
                    setFormData({ ...formData, time_spent: e.target.value })
                  }
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <textarea
                placeholder="Summary"
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
              <textarea
                placeholder="Tools Used (comma-separated, e.g., nmap, Burp Suite, sqlmap)"
                value={formData.tools_used}
                onChange={(e) =>
                  setFormData({ ...formData, tools_used: e.target.value })
                }
                rows={2}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />

              {/* File Upload Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {editingId
                    ? "Upload New File (optional)"
                    : "Upload Writeup File"}
                </label>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  PDF for traditional writeups, or ZIP containing README.md +
                  images for markdown writeups
                </div>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.zip"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="hidden"
                    id="pdf-input"
                  />
                  <label
                    htmlFor="pdf-input"
                    className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="text-slate-600 dark:text-slate-400">
                      {selectedFile
                        ? selectedFile.name
                        : editingId
                        ? "Click to upload new file (PDF or ZIP)"
                        : "Click to select PDF or ZIP file"}
                    </span>
                  </label>
                </div>

                {/* File info and progress */}
                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    {!isUploading && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setError(null);
                        }}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Upload progress */}
                {isUploading && uploadProgress > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-700 dark:text-slate-300">
                        Uploading...
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Current File URL display when editing */}
              {editingId && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Current Writeup URL (PDF only)
                  </label>
                  <input
                    type="text"
                    value={formData.writeup_url}
                    onChange={(e) =>
                      setFormData({ ...formData, writeup_url: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    placeholder="Writeup URL (leave empty for markdown)"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    💡 Upload a new file above to replace. PDF uses URL, ZIP
                    stores markdown content.
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-black dark:bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-900 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isUploading
                    ? "Uploading..."
                    : editingId
                    ? "Update"
                    : "Create"}
                </button>
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Writeups List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">
              Loading writeups...
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    Title
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    Platform
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    Difficulty
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {writeups.map((writeup) => (
                  <tr
                    key={writeup.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm sm:text-base text-slate-900 dark:text-white">
                      {writeup.title}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-base text-slate-600 dark:text-slate-400">
                      {writeup.platform}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span
                        className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          writeup.difficulty === "Easy"
                            ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : writeup.difficulty === "Medium"
                            ? "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300"
                            : writeup.difficulty === "Hard"
                            ? "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"
                            : "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {writeup.difficulty}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 flex gap-1 sm:gap-2">
                      <button
                        onClick={() => handleEdit(writeup)}
                        className="p-1.5 sm:p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title="Edit writeup"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleGenerateAI(writeup.id)}
                        disabled={generatingAI === writeup.id}
                        className="p-1.5 sm:p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Generate AI content"
                      >
                        <Sparkles
                          className={`h-4 w-4 ${
                            generatingAI === writeup.id ? "animate-pulse" : ""
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleDelete(writeup.id)}
                        className="p-1.5 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        title="Delete writeup"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
