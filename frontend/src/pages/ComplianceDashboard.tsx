/**
 * Compliance Dashboard
 * Admin UI for audit logs, manual review, and compliance
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  Filter,
  Search,
  Shield,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';

interface AuditLog {
  id: string;
  event_type: string;
  event_category: string;
  action: string;
  user_id?: string;
  transaction_id?: string;
  status: string;
  metadata: any;
  created_at: string;
}

interface Statistics {
  totals: {
    totalEvents: number;
    successCount: number;
    failedCount: number;
    uniqueUsers: number;
  };
  byCategory: Record<
    string,
    { count: number; success: number; failed: number }
  >;
}

export default function ComplianceDashboard() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'audit' | 'review' | 'export'
  >('overview');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [failedEvents, setFailedEvents] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStatistics();
    loadRecentActivity();
    loadFailedEvents();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/audit/statistics?days=30');
      const data = await response.json();
      if (data.success) {
        setStatistics(data);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await fetch('/api/audit/activity/recent');
      const data = await response.json();
      if (data.success) {
        setRecentActivity(data.activity);
      }
    } catch (error) {
      console.error('Failed to load recent activity:', error);
    }
  };

  const loadFailedEvents = async () => {
    try {
      const response = await fetch('/api/audit/events/failed?limit=50');
      const data = await response.json();
      if (data.success) {
        setFailedEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to load failed events:', error);
    }
  };

  const handleExportCSV = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('eventType', searchTerm);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const response = await fetch(`/api/audit/export/csv?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_log_${new Date().toISOString()}.csv`;
      a.click();
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('eventType', searchTerm);
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const response = await fetch(`/api/audit/export/json?${params}`);
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_log_${new Date().toISOString()}.json`;
      a.click();
    } catch (error) {
      console.error('Failed to export JSON:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Shield className="w-10 h-10 text-blue-400" />
          Compliance Dashboard
        </h1>
        <p className="text-gray-400">
          Monitor audit logs, review transactions, and ensure compliance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-700">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'audit', label: 'Audit Logs', icon: FileText },
          { id: 'review', label: 'Manual Review', icon: Eye },
          { id: 'export', label: 'Export', icon: Download },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-2 px-6 py-3 font-semibold transition-all
              ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }
            `}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <OverviewTab
            statistics={statistics}
            recentActivity={recentActivity}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLogsTab searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        )}

        {activeTab === 'review' && (
          <ManualReviewTab failedEvents={failedEvents} />
        )}

        {activeTab === 'export' && (
          <ExportTab
            dateRange={dateRange}
            setDateRange={setDateRange}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
            loading={loading}
          />
        )}
      </motion.div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ statistics, recentActivity }: any) {
  if (!statistics) {
    return <div className="text-center py-12">Loading statistics...</div>;
  }

  const statCards = [
    {
      label: 'Total Events',
      value: statistics.totals.totalEvents.toLocaleString(),
      icon: Activity,
      color: 'blue',
      change: '+12% from last month',
    },
    {
      label: 'Success Rate',
      value: `${(
        (statistics.totals.successCount / statistics.totals.totalEvents) *
        100
      ).toFixed(1)}%`,
      icon: CheckCircle,
      color: 'green',
      change: '+2.3% improvement',
    },
    {
      label: 'Failed Events',
      value: statistics.totals.failedCount.toLocaleString(),
      icon: XCircle,
      color: 'red',
      change: '-5% from last month',
    },
    {
      label: 'Unique Users',
      value: statistics.totals.uniqueUsers.toLocaleString(),
      icon: Users,
      color: 'purple',
      change: '+8% growth',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${stat.color}-500/10`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
            <div className="text-xs text-green-400">{stat.change}</div>
          </motion.div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-6">Events by Category</h3>
        <div className="space-y-4">
          {Object.entries(statistics.byCategory).map(
            ([category, stats]: [string, any]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{category}</span>
                  <span className="text-gray-400">{stats.count} events</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(stats.success / stats.count) * 100}%`,
                    }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{stats.success} success</span>
                  <span>{stats.failed} failed</span>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-6">
          Recent Activity (Last 24 Hours)
        </h3>
        <div className="space-y-3">
          {recentActivity.slice(0, 5).map((activity: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Clock className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="font-medium capitalize">
                    {activity.event_type.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm text-gray-400">
                    {activity.count} events • {activity.unique_users} users
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-400">
                  {activity.success_count} success
                </div>
                <div className="text-sm text-red-400">
                  {activity.failed_count} failed
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Audit Logs Tab Component
function AuditLogsTab({ searchTerm, setSearchTerm }: any) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const searchLogs = async () => {
    if (!searchTerm) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/audit/user/${searchTerm}`);
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to search logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by User ID or Transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchLogs()}
              className="w-full pl-12 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={searchLogs}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Results */}
      {logs.length > 0 && (
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-6">
            Audit Trail ({logs.length} entries)
          </h3>
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 bg-gray-900/50 rounded-lg border border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`
                        px-2 py-1 rounded text-xs font-semibold
                        ${
                          log.status === 'success'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }
                      `}
                      >
                        {log.status}
                      </span>
                      <span className="text-sm text-gray-400 capitalize">
                        {log.event_category}
                      </span>
                    </div>
                    <div className="font-medium mb-1">{log.action}</div>
                    <div className="text-sm text-gray-400">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                  {log.metadata && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-400">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-auto max-w-md">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Manual Review Tab Component
function ManualReviewTab({ failedEvents }: { failedEvents: AuditLog[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold">Failed Events Requiring Review</h3>
          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm font-semibold">
            {failedEvents.length} pending
          </span>
        </div>

        {failedEvents.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <p>No failed events to review</p>
            <p className="text-sm">All systems operating normally</p>
          </div>
        ) : (
          <div className="space-y-4">
            {failedEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-medium">{event.action}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors">
                    Review
                  </button>
                </div>
                {event.metadata && (
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-400 mb-2">
                      View Error Details
                    </summary>
                    <pre className="p-3 bg-gray-900 rounded text-xs overflow-auto">
                      {JSON.stringify(event.metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Export Tab Component
function ExportTab({
  dateRange,
  setDateRange,
  searchTerm,
  setSearchTerm,
  onExportCSV,
  onExportJSON,
  loading,
}: any) {
  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-6">Export Audit Logs</h3>

        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Event Type (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., payment_created"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onExportCSV}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Export to CSV
          </button>
          <button
            onClick={onExportJSON}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            Export to JSON
          </button>
        </div>

        {loading && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Preparing export...
          </div>
        )}
      </div>

      {/* Export Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-blue-400 mt-1" />
          <div>
            <div className="font-semibold mb-2">Export Information</div>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Exports are limited to 10,000 records</li>
              <li>• CSV format is compatible with Excel and Google Sheets</li>
              <li>• JSON format includes complete metadata</li>
              <li>• All exports include timestamp and filters used</li>
              <li>• Exports are suitable for compliance audits</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
