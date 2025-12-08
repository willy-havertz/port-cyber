import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Clock, TrendingUp } from "lucide-react";

interface CTFStats {
  lastUpdated: string;
  platforms: {
    [key: string]: {
      name: string;
      username: string;
      rank?: string;
      level?: number;
      points: number;
      totalOwns?: number;
      roomsCompleted?: number;
      badges?: number;
    };
  };
  totals: {
    machinesCompleted: number;
    pointsEarned: number;
    hoursSpent: number;
    platforms: number;
  };
}

const CTFStatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<CTFStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load stats from JSON file
    fetch("/src/data/ctf-stats.json")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading CTF stats:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 dark:text-slate-400">Loading stats...</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      icon: Trophy,
      label: "Machines Completed",
      value: stats.totals.machinesCompleted,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-100 dark:bg-yellow-900",
    },
    {
      icon: Target,
      label: "Points Earned",
      value: stats.totals.pointsEarned.toLocaleString(),
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      icon: Clock,
      label: "Hours Spent",
      value: stats.totals.hoursSpent,
      suffix: "hrs",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      icon: TrendingUp,
      label: "Platforms",
      value: stats.totals.platforms,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {stat.value}
              {stat.suffix && (
                <span className="text-lg text-slate-600 dark:text-slate-400 ml-1">
                  {stat.suffix}
                </span>
              )}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Platform Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(stats.platforms).map(([key, platform], index) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {platform.name}
              </h3>
              {platform.rank && (
                <span className="px-3 py-1 text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">
                  {platform.rank}
                </span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Username
                </span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {platform.username}
                </span>
              </div>

              {platform.badges !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Badges
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {platform.badges}
                  </span>
                </div>
              )}

              {platform.points !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Points
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {platform.points.toLocaleString()}
                  </span>
                </div>
              )}

              {platform.totalOwns !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Total Owns
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {platform.totalOwns}
                  </span>
                </div>
              )}

              {platform.roomsCompleted !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">
                    Rooms Completed
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {platform.roomsCompleted}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Last Updated */}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        Last updated: {new Date(stats.lastUpdated).toLocaleString()}
      </p>
    </div>
  );
};

export default CTFStatsDashboard;
