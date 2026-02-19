import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { Loader2, Calendar, Clock } from 'lucide-react';
import useSWR from 'swr';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AnalyticsDashboard() {
    const { data: generalData, error: generalError, isLoading: generalLoading } = useSWR('/api/admin/stats', fetcher, {
        refreshInterval: 60000
    });

    const [timeRange, setTimeRange] = useState<'monthly' | 'daily' | 'hourly'>('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

    const { data: accessData, error: accessError, isLoading: accessLoading } = useSWR(
        `/api/admin/stats/access?type=${timeRange}&date=${timeRange === 'monthly' ? '' : (timeRange === 'daily' ? selectedMonth : selectedDate)}`,
        fetcher
    );

    if (generalLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (generalError || generalData?.error) {
        return (
            <div className="flex justify-center items-center h-64 text-red-500">
                データの読み込みに失敗しました
            </div>
        );
    }

    const { overview, chartData, devices, referrers } = generalData;
    const hasDeviceData = devices && devices.some((d: any) => d.value > 0);

    return (
        <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="text-sm font-medium leading-none tracking-tight text-muted-foreground">
                        総閲覧数 (Total Page Views)
                    </div>
                    <div className="text-2xl font-bold mt-2">
                        {overview.totalViews.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Main Access Chart */}
                <div className="col-span-4 rounded-xl border bg-card text-card-foreground shadow">
                    <div className="p-6 pb-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h3 className="font-semibold leading-none tracking-tight">
                            アクセス解析
                        </h3>
                        <div className="flex items-center gap-2">
                            <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="期間" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="monthly">月間推移</SelectItem>
                                    <SelectItem value="daily">日別推移</SelectItem>
                                    <SelectItem value="hourly">時間別</SelectItem>
                                </SelectContent>
                            </Select>

                            {timeRange === 'daily' && (
                                <input
                                    type="month"
                                    aria-label="月を選択"
                                    className="border rounded px-2 py-1 text-sm bg-background"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                />
                            )}

                            {timeRange === 'hourly' && (
                                <input
                                    type="date"
                                    aria-label="日付を選択"
                                    className="border rounded px-2 py-1 text-sm bg-background"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            )}
                        </div>
                    </div>
                    <div className="p-6 pt-4 h-[350px] w-full">
                        {accessLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={accessData}
                                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis
                                        dataKey={timeRange === 'hourly' ? 'time' : 'date'}
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(str) => {
                                            if (timeRange === 'monthly') return str;
                                            if (timeRange === 'daily') return str.slice(8); // show only day
                                            return str;
                                        }}
                                    />
                                    <YAxis
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))' }}
                                        formatter={(value: any) => [value, 'Views']}
                                        labelFormatter={(label) => {
                                            if (timeRange === 'hourly') return `${label}時台`;
                                            return label;
                                        }}
                                    />
                                    <Bar
                                        dataKey="views"
                                        name="Page Views"
                                        fill="#3b82f6"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
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

                    {/* Location List (Country) */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="font-semibold leading-none tracking-tight mb-4">
                            アクセス地域 (Country)
                        </h3>
                        <ScrollArea className="h-[200px] w-full pr-4">
                            {generalData?.locations?.countries && generalData.locations.countries.length > 0 ? (
                                <div className="space-y-4">
                                    {generalData.locations.countries.map((loc: any, index: number) => (
                                        <div key={index} className="flex items-center">
                                            <div className="ml-4 space-y-1">
                                                <p className="text-sm font-medium leading-none">{loc.name}</p>
                                            </div>
                                            <div className="ml-auto font-medium">{loc.count}</div>
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
