"use client";

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Loader2, Smartphone, Monitor } from 'lucide-react';
import useSWR from 'swr';
import { ScrollArea } from '@/components/ui/scroll-area';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

    const { overview, chartData, devices, referrers } = data;

    // Check if devices data exists, otherwise use dummy or hide
    const hasDeviceData = devices && devices.some((d: any) => d.value > 0);

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
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Main Chart */}
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 pb-2">
                        <h3 className="font-semibold leading-none tracking-tight">
                            アクセス & 再生数推移 (過去30日間)
                        </h3>
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
                                    tickFormatter={(str) => str.slice(5)}
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

                {/* Device & Referrer Column */}
                <div className="col-span-3 space-y-4">
                    {/* Device Chart */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">
                            デバイス比率
                        </h3>
                        <div className="h-[200px] w-full flex items-center justify-center">
                            {hasDeviceData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={devices}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {devices.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-muted-foreground text-sm py-8 text-center">
                                    データ計測中...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Referrer List */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">
                            流入元 (Top Referrers)
                        </h3>
                        <ScrollArea className="h-[200px] w-full pr-4">
                            {referrers && referrers.length > 0 ? (
                                <div className="space-y-4">
                                    {referrers.map((ref: any, index: number) => (
                                        <div key={index} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{ref.domain}</p>
                                            </div>
                                            <div className="ml-auto font-medium">{ref.count}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-muted-foreground text-sm py-8 text-center">
                                    データ計測中...
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    );
}
