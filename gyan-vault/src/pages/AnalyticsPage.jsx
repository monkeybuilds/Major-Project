import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';
import { HiOutlineChartBar, HiOutlineTrendingUp, HiOutlineDocumentReport, HiOutlineChatAlt2 } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import api from '../api';

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    api.get('/analytics/stats'),
                    api.get('/analytics/activity')
                ]);
                setStats(statsRes.data);
                // Chart data from our updated backend endpoint
                setChartData(activityRes.data.chart_data || []);
            } catch (err) {
                toast.error('Failed to load analytics data');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Framer Motion variants
    const pageVariants = {
        initial: { opacity: 0, y: 15 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, scale: 0.98, transition: { duration: 0.3 } }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    // Custom Tooltip for Recharts to match our premium aesthetic
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface/90 backdrop-blur-md border border-border p-4 rounded-xl shadow-xl">
                    <p className="font-semibold mb-2 text-text-primary">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm" style={{ color: entry.color }}>
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span>{entry.name}:</span>
                            <span className="font-medium">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            className="app-layout"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <Sidebar />
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title flex items-center gap-3">
                        <HiOutlineChartBar className="text-primary" />
                        Analytics Insights
                    </h1>
                    <p className="page-subtitle">Track your knowledge base growth and AI interactions over time.</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="processing-spinner"></div>
                    </div>
                ) : (
                    <motion.div
                        className="space-y-8 max-w-6xl mx-auto pb-12"
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                    >
                        {/* Summary KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: 'Total Documents', value: stats?.total_documents || 0, icon: HiOutlineDocumentReport, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { title: 'Queries Asked', value: stats?.total_queries || 0, icon: HiOutlineChatAlt2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                { title: 'Chat Sessions', value: stats?.total_chat_sessions || 0, icon: HiOutlineTrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { title: 'Pages Processed', value: stats?.total_pages || 0, icon: HiOutlineChartBar, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                            ].map((kpi, i) => (
                                <motion.div
                                    key={i}
                                    variants={itemVariants}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="p-6 bg-surface/60 backdrop-blur-sm border border-border rounded-3xl shadow-lg flex items-center gap-4 group transition-all duration-300"
                                >
                                    <div className={`p-4 rounded-2xl ${kpi.bg}`}>
                                        <kpi.icon size={28} className={kpi.color} />
                                    </div>
                                    <div>
                                        <p className="text-secondary text-sm font-medium mb-1">{kpi.title}</p>
                                        <p className="text-3xl font-bold bg-gradient-to-br from-text-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-transform origin-left">
                                            {kpi.value}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Charts Area */}
                        {chartData && chartData.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                {/* Line Chart: Activity over Time */}
                                <motion.div variants={itemVariants} className="p-6 sm:p-8 bg-surface/80 backdrop-blur-xl border border-border rounded-3xl shadow-xl">
                                    <h3 className="text-xl font-bold mb-6 text-primary flex items-center gap-2">
                                        <HiOutlineTrendingUp />
                                        7-Day Activity Trend
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                                                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} />

                                                <Line
                                                    type="monotone"
                                                    dataKey="queries"
                                                    name="Queries"
                                                    stroke="#8b5cf6"
                                                    strokeWidth={3}
                                                    dot={{ r: 4, strokeWidth: 2 }}
                                                    activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2, fill: '#000' }}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="uploads"
                                                    name="Uploads"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    dot={{ r: 4, strokeWidth: 2 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.div>

                                {/* Bar Chart: Daily Breakdown */}
                                <motion.div variants={itemVariants} className="p-6 sm:p-8 bg-surface/80 backdrop-blur-xl border border-border rounded-3xl shadow-xl">
                                    <h3 className="text-xl font-bold mb-6 text-primary flex items-center gap-2">
                                        <HiOutlineChartBar />
                                        Daily Interaction Volume
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                                                <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                                                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                                <Legend wrapperStyle={{ paddingTop: '20px' }} />

                                                <Bar dataKey="queries" name="AI Queries" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                                <Bar dataKey="uploads" name="Documents Uploaded" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </motion.div>

                            </div>
                        ) : (
                            <motion.div variants={itemVariants} className="p-12 text-center bg-surface/50 border border-border rounded-3xl">
                                <HiOutlineDocumentReport size={48} className="mx-auto text-secondary mb-4 opacity-50" />
                                <h3 className="text-xl font-semibold mb-2">Not enough data yet</h3>
                                <p className="text-secondary max-w-md mx-auto">Upload documents and ask questions to start seeing your knowledge base analytics in action.</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </main>
        </motion.div>
    );
}
