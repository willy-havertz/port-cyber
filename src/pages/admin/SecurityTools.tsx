import React, { useMemo, useState } from "react";
import {
  Shield,
  Server,
  Bug,
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Download,
  Plus,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import {
  runAdvancedScan,
  runApiAudit,
  searchCVEs,
  type AdvancedFinding,
  type AdvancedScanResponse,
  type ApiAuditProbe,
  type ApiAuditResponse,
  type CveSearchResponse,
} from "../../lib/api";

interface EndpointRow {
  path: string;
  method: string;
}

const sampleAdvanced: AdvancedScanResponse = {
  target: "https://example.com",
  status: "completed",
  timestamp: new Date().toISOString(),
  metadata: {
    status_code: 200,
    final_url: "https://example.com/",
    redirects: 0,
    server: "nginx",
    powered_by: "Express",
    content_type: "text/html",
    tls: { protocol: "TLSv1.3", issuer: "LE", subject: "example.com" },
    allow_methods: "GET, HEAD, OPTIONS",
  },
  findings: [
    {
      type: "Missing Security Header",
      severity: "Low",
      description: "Missing Strict-Transport-Security header",
    },
    {
      type: "Cookie Missing HttpOnly",
      severity: "Medium",
      description: "Cookie 'sessionid' is not HttpOnly",
    },
    {
      type: "Server Banner Exposed",
      severity: "Info",
      description: "Server header reveals 'nginx'",
    },
  ],
};

const sampleAudit: ApiAuditResponse = {
  target: "https://api.example.com/",
  timestamp: new Date().toISOString(),
  probes: [
    {
      endpoint: "/health",
      method: "GET",
      url: "https://api.example.com/health",
      status_code: 200,
      content_type: "application/json",
      allow_methods: "GET, HEAD, OPTIONS",
    },
    {
      endpoint: "/users",
      method: "GET",
      url: "https://api.example.com/users",
      status_code: 500,
      content_type: "application/json",
    },
  ],
  findings: [
    {
      type: "Server Error",
      severity: "High",
      description: "/users returned 500",
    },
    {
      type: "API over HTTP",
      severity: "Medium",
      description: "/users served over HTTP; prefer HTTPS",
    },
  ],
};

const sampleCve: CveSearchResponse = {
  query: "openssl",
  count: 2,
  source: "sample",
  timestamp: new Date().toISOString(),
  results: [
    {
      id: "CVE-2024-12345",
      description: "Sample OpenSSL buffer overflow vulnerability.",
      published: "2024-09-01",
      modified: "2024-09-05",
      severity: "High",
      score: 8.2,
    },
    {
      id: "CVE-2023-0000",
      description: "Sample CVE when upstream NVD is unreachable.",
      published: null,
      modified: null,
      severity: "Medium",
      score: 5.0,
    },
  ],
};

const severityColor = (severity?: string) => {
  switch (severity?.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200";
    case "high":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-200";
    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200";
    case "low":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200";
  }
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString();
};

export default function SecurityTools() {
  const [advTarget, setAdvTarget] = useState("https://example.com");
  const [includePortScan, setIncludePortScan] = useState(false);
  const [advLoading, setAdvLoading] = useState(false);
  const [advError, setAdvError] = useState<string | null>(null);
  const [advResult, setAdvResult] = useState<AdvancedScanResponse | null>(null);

  const [baseUrl, setBaseUrl] = useState("https://api.example.com");
  const [endpoints, setEndpoints] = useState<EndpointRow[]>([
    { path: "/", method: "GET" },
    { path: "/health", method: "GET" },
  ]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiResult, setApiResult] = useState<ApiAuditResponse | null>(null);

  const [cveQuery, setCveQuery] = useState("openssl");
  const [cveLoading, setCveLoading] = useState(false);
  const [cveError, setCveError] = useState<string | null>(null);
  const [cveResult, setCveResult] = useState<CveSearchResponse | null>(null);

  const [useMock, setUseMock] = useState(true);

  const endpointRows = useMemo(() => endpoints, [endpoints]);

  const handleRunAdvanced = async () => {
    try {
      setAdvLoading(true);
      setAdvError(null);
      const data = await runAdvancedScan({
        target_url: advTarget,
        include_port_scan: includePortScan,
      });
      setAdvResult(data);
    } catch (err: any) {
      setAdvError(
        err?.response?.data?.detail || err?.message || "Advanced scan failed",
      );
      if (useMock) {
        setAdvResult(sampleAdvanced);
      }
    } finally {
      setAdvLoading(false);
    }
  };

  const handleRunAudit = async () => {
    try {
      setApiLoading(true);
      setApiError(null);
      const data = await runApiAudit({
        base_url: baseUrl,
        endpoints: endpoints.map((ep) => ({
          path: ep.path,
          method: ep.method,
        })),
      });
      setApiResult(data);
    } catch (err: any) {
      setApiError(
        err?.response?.data?.detail || err?.message || "API audit failed",
      );
      if (useMock) {
        setApiResult(sampleAudit);
      }
    } finally {
      setApiLoading(false);
    }
  };

  const handleSearchCves = async () => {
    try {
      setCveLoading(true);
      setCveError(null);
      const data = await searchCVEs(cveQuery);
      setCveResult(data);
    } catch (err: any) {
      setCveError(
        err?.response?.data?.detail || err?.message || "CVE search failed",
      );
      if (useMock) {
        setCveResult(sampleCve);
      }
    } finally {
      setCveLoading(false);
    }
  };

  const updateEndpoint = (
    index: number,
    field: keyof EndpointRow,
    value: string,
  ) => {
    setEndpoints((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addEndpoint = () => {
    setEndpoints((prev) => [...prev, { path: "/new-endpoint", method: "GET" }]);
  };

  const removeEndpoint = (index: number) => {
    setEndpoints((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 lg:space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              Security Tools
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Advanced web scan, API audit, and CVE intelligence (auth required)
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <input
              type="checkbox"
              className="h-4 w-4 accent-green-500"
              checked={useMock}
              onChange={(e) => setUseMock(e.target.checked)}
            />
            Use mock data if backend is offline
          </label>
        </div>

        {/* Advanced Web Scan */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">
          <div className="p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Advanced Web Scan
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                TLS, headers, cookies, and optional quick port scan.
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {advError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800/50">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p className="text-sm">{advError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target URL
                </label>
                <input
                  value={advTarget}
                  onChange={(e) => setAdvTarget(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                />
              </div>
              <div className="flex items-center gap-2 mt-6 md:mt-auto">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-green-500"
                  checked={includePortScan}
                  onChange={(e) => setIncludePortScan(e.target.checked)}
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Include port scan (quick)
                </span>
              </div>
            </div>
            <button
              onClick={handleRunAdvanced}
              disabled={advLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-60 shadow-lg hover:shadow-green-500/25 transition-all"
            >
              {advLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              {advLoading ? "Scanning..." : "Run Advanced Scan"}
            </button>

            {advResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>
                      {advResult.target} • {advResult.metadata?.status_code} •{" "}
                      {advResult.metadata?.content_type}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {advResult.metadata?.server && (
                      <div className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                        <span className="font-semibold">Server:</span>{" "}
                        {advResult.metadata.server}
                      </div>
                    )}
                    {advResult.metadata?.powered_by && (
                      <div className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                        <span className="font-semibold">Powered By:</span>{" "}
                        {advResult.metadata.powered_by}
                      </div>
                    )}
                    {advResult.metadata?.tls?.protocol && (
                      <div className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                        <span className="font-semibold">TLS:</span>{" "}
                        {advResult.metadata.tls.protocol}
                      </div>
                    )}
                    {advResult.metadata?.allow_methods && (
                      <div className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-700">
                        <span className="font-semibold">Allow:</span>{" "}
                        {advResult.metadata.allow_methods}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {advResult.findings.map((finding: AdvancedFinding, idx) => (
                      <div
                        key={`${finding.type}-${idx}`}
                        className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-start gap-3"
                      >
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${severityColor(
                            finding.severity,
                          )}`}
                        >
                          {finding.severity || "Info"}
                        </span>
                        <div className="text-sm text-slate-800 dark:text-slate-200">
                          <p className="font-semibold">{finding.type}</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            {finding.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200">
                    <p className="font-semibold mb-2">Metadata</p>
                    <pre className="text-xs whitespace-pre-wrap break-words">
                      {JSON.stringify(advResult.metadata, null, 2)}
                    </pre>
                  </div>
                  <button
                    onClick={() =>
                      downloadJson(advResult, "advanced-scan.json")
                    }
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-700 hover:bg-slate-900 transition-colors"
                  >
                    <Download className="h-4 w-4" /> Download JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* API Security Audit */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">
          <div className="p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/25">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                API Security Audit
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Probe endpoints for transport, errors, and risky methods.
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {apiError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800/50">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p className="text-sm">{apiError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Base URL
                </label>
                <input
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.example.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                />
              </div>
              <div className="flex items-center justify-end md:items-end">
                <button
                  onClick={addEndpoint}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 hover:border-green-400 dark:hover:border-green-600 transition-all"
                >
                  <Plus className="h-4 w-4" /> Add Endpoint
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {endpointRows.map((ep, idx) => (
                <div
                  key={`${ep.path}-${idx}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  <select
                    value={ep.method}
                    onChange={(e) =>
                      updateEndpoint(idx, "method", e.target.value)
                    }
                    className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                  >
                    {[
                      "GET",
                      "POST",
                      "PUT",
                      "DELETE",
                      "PATCH",
                      "HEAD",
                      "OPTIONS",
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <input
                    value={ep.path}
                    onChange={(e) =>
                      updateEndpoint(idx, "path", e.target.value)
                    }
                    placeholder="/path"
                    className="md:col-span-9 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                  />
                  <button
                    onClick={() => removeEndpoint(idx)}
                    className="md:col-span-1 text-sm text-slate-500 hover:text-red-600 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleRunAudit}
              disabled={apiLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white disabled:opacity-60 shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              {apiLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Server className="h-4 w-4" />
              )}
              {apiLoading ? "Auditing..." : "Run API Audit"}
            </button>

            {apiResult && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-3">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    Target: {apiResult.target}
                  </div>
                  <div className="space-y-2">
                    {apiResult.findings.map((finding, idx) => (
                      <div
                        key={`${finding.type}-${idx}`}
                        className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-start gap-3"
                      >
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${severityColor(
                            finding.severity,
                          )}`}
                        >
                          {finding.severity || "Info"}
                        </span>
                        <div className="text-sm text-slate-800 dark:text-slate-200">
                          <p className="font-semibold">{finding.type}</p>
                          <p className="text-slate-600 dark:text-slate-400">
                            {finding.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    Endpoint Probes
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {apiResult.probes.map((probe: ApiAuditProbe, idx) => (
                      <div
                        key={`${probe.endpoint}-${idx}`}
                        className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
                      >
                        <div className="flex items-center justify-between text-sm text-slate-800 dark:text-slate-200">
                          <span className="font-semibold">
                            {probe.method} {probe.endpoint}
                          </span>
                          <span className="text-xs text-slate-500">
                            {probe.status_code || "-"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 break-words">
                          {probe.url}
                        </p>
                        {probe.allow_methods && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Allow: {probe.allow_methods}
                          </p>
                        )}
                        {probe.error && (
                          <p className="text-xs text-red-500 mt-1">
                            {probe.error}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => downloadJson(apiResult, "api-audit.json")}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white dark:bg-slate-700 hover:bg-slate-900 transition-colors"
                  >
                    <Download className="h-4 w-4" /> Download JSON
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CVE Intelligence */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200/50 dark:border-slate-700/50">
          <div className="p-4 sm:p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
              <Bug className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                CVE Intelligence
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Search NVD for recent CVEs (falls back to sample when offline).
              </p>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            {cveError && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800/50">
                <AlertCircle className="h-4 w-4 mt-0.5" />
                <p className="text-sm">{cveError}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Keyword or CVE ID
                </label>
                <input
                  value={cveQuery}
                  onChange={(e) => setCveQuery(e.target.value)}
                  placeholder="e.g., openssl, CVE-2024-12345"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:outline-none transition-all"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearchCves}
                  disabled={cveLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white disabled:opacity-60 w-full shadow-lg hover:shadow-emerald-500/25 transition-all"
                >
                  {cveLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                  {cveLoading ? "Searching..." : "Search CVEs"}
                </button>
              </div>
            </div>

            {cveResult && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                  <span>
                    {cveResult.count} results from {cveResult.source || "nvd"}
                  </span>
                  <button
                    onClick={() => downloadJson(cveResult, "cve-search.json")}
                    className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900"
                  >
                    <Download className="h-3 w-3" /> JSON
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {cveResult.results.map((item, idx) => (
                    <div
                      key={`${item.id}-${idx}`}
                      className="p-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 space-y-2"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {item.id}
                        </span>
                        {item.severity && (
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${severityColor(
                              item.severity,
                            )}`}
                          >
                            {item.severity}{" "}
                            {item.score ? `(${item.score})` : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-4">
                        {item.description}
                      </p>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                        <div>Published: {formatDate(item.published)}</div>
                        <div>Modified: {formatDate(item.modified)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
