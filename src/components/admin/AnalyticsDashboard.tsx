"use client";

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function AnalyticsDashboard() {
    const { data, error, isLoading } = useSWR('/api/admin/stats', fetcher, {
        refreshInterval: 60000 // Refresh every minute
    });

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error || data?.error) {
        return (
            <div className="flex justify-center items-center h-64 text-red-500">
                データの読み込みに失敗しました
            </div>
        );
    }

    const { overview, chartData } = data;

    return (
        <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium leading-none tracking-tight text-muted-foreground">
                        総閲覧数 (Page Views)
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        {overview.totalViews.toLocaleString()}
                    </div>
                </div>
                {/* 
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium leading-none tracking-tight text-muted-foreground">
                        総再生数 (Total Plays)
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        -
                    </div>
                </div> 
                */}
            </div>

            {/* Chart */}
            <div className="rounded-xl border bg-card text-card-foreground shadow">
                <div className="p-6 pb-2">
                    <h3 className="font-semibold leading-none tracking-tight">
                        アクセス & 再生数推移 (過去30日間)
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        日別のページビューと楽曲再生数
                    </p>
                </div>
                <div className="p-6 pt-0 h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPlays" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(str) => str.slice(5)} // Show MM-DD
                            />
                            <YAxis
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(number) => `${number}`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                            />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="views"
                                name="Page Views"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorViews)"
                            />
                            <Area
                                type="monotone"
                                dataKey="plays"
                                name="Song Plays"
                                stroke="#10b981"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorPlays)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
