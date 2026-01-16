import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { supabase } from '../../configs/supabaseClient';
import dayjs from '../../lib/dayjs';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Icons
import {
    FileText,
    Bell,
    ChartLineUp,
    CaretRight,
    Clock,
    Folder,
    CalendarBlank
} from '@phosphor-icons/react';

const Dashboard = ({ toggleCollapsedNav }) => {
    const [reminders, setReminders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [stats, setStats] = useState({
        totalDocuments: 0,
        upcomingReminders: 0,
        recentActivity: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        toggleCollapsedNav(false);
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Fetch upcoming reminders
            const { data: remindersData } = await supabase
                .from('app_reminders')
                .select('*')
                .gte('schedule_at', new Date().toISOString())
                .order('schedule_at', { ascending: true })
                .limit(5);

            // Fetch recent documents
            const { data: docsData } = await supabase
                .from('app_documents')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(6);

            // Fetch statistics
            const { count: docCount } = await supabase
                .from('app_documents')
                .select('*', { count: 'exact', head: true });

            const { count: reminderCount } = await supabase
                .from('app_reminders')
                .select('*', { count: 'exact', head: true })
                .gte('schedule_at', new Date().toISOString());

            setReminders(remindersData || []);
            setDocuments(docsData || []);
            setStats({
                totalDocuments: docCount || 0,
                upcomingReminders: reminderCount || 0,
                recentActivity: (docCount || 0) + (reminderCount || 0)
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8";

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className={containerVariants}>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Welcome back to your Sisgate PRO Hub workspace.</p>
                    </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatsCard
                        title="Total Documents"
                        value={stats.totalDocuments}
                        icon={FileText}
                        color="text-blue-600"
                        bg="bg-blue-50"
                    />
                    <StatsCard
                        title="Upcoming Reminders"
                        value={stats.upcomingReminders}
                        icon={Bell}
                        color="text-amber-600"
                        bg="bg-amber-50"
                    />
                    <StatsCard
                        title="Recent Activity"
                        value={stats.recentActivity}
                        icon={ChartLineUp}
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                    />
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <QuickActionCard
                            to="/apps/ai/create-doc"
                            label="Create Document"
                            icon={FileText}
                            color="text-blue-600"
                            bg="bg-blue-50 group-hover:bg-blue-600 group-hover:text-white"
                        />
                        <QuickActionCard
                            to="/library"
                            label="Browse Library"
                            icon={Folder}
                            color="text-teal-600"
                            bg="bg-teal-50 group-hover:bg-teal-600 group-hover:text-white"
                        />
                        <QuickActionCard
                            to="/reminders"
                            label="Check Reminders"
                            icon={Bell}
                            color="text-amber-600"
                            bg="bg-amber-50 group-hover:bg-amber-600 group-hover:text-white"
                        />
                        <QuickActionCard
                            to="/apps/calendar"
                            label="View Calendar"
                            icon={CalendarBlank}
                            color="text-indigo-600"
                            bg="bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white"
                        />
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upcoming Reminders List */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base font-semibold text-slate-900">Upcoming Reminders</CardTitle>
                            <Link to="/reminders" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center transition-colors">
                                View All <CaretRight className="ml-1 h-3 w-3" weight="bold" />
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {loading ? (
                                <div className="flex items-center justify-center h-48 text-slate-400">
                                    <span className="loading-spinner mr-2"></span> Loading...
                                </div>
                            ) : reminders.length === 0 ? (
                                <EmptyState
                                    icon={Bell}
                                    message="No upcoming reminders"
                                    desc="You're all caught up for now!"
                                />
                            ) : (
                                <div className="space-y-4">
                                    {reminders.map((reminder, idx) => (
                                        <div key={idx} className="flex items-start group">
                                            <div className="flex-shrink-0 mr-4 mt-1">
                                                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center ring-1 ring-amber-100">
                                                    <Clock size={16} weight="duotone" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                                                    {reminder.title}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-0.5">
                                                    {dayjs(reminder.schedule_at).format('MMM D, YYYY [at] h:mm A')}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Documents List */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                            <CardTitle className="text-base font-semibold text-slate-900">Recent Documents</CardTitle>
                            <Link to="/library" className="text-sm font-medium text-teal-600 hover:text-teal-700 flex items-center transition-colors">
                                Browse All <CaretRight className="ml-1 h-3 w-3" weight="bold" />
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-0">
                            {loading ? (
                                <div className="flex items-center justify-center h-48 text-slate-400">
                                    <span className="loading-spinner mr-2"></span> Loading...
                                </div>
                            ) : documents.length === 0 ? (
                                <EmptyState
                                    icon={FileText}
                                    message="No documents yet"
                                    desc="Create your first document to get started."
                                />
                            ) : (
                                <div className="space-y-4">
                                    {documents.map((doc, idx) => (
                                        <div key={idx} className="flex items-center group p-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors cursor-default">
                                            <div className="flex-shrink-0 mr-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center ring-1 ring-blue-100 group-hover:scale-105 transition-transform">
                                                    <FileText size={20} weight="duotone" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {doc.name}
                                                </p>
                                                <div className="flex items-center mt-1 space-x-2">
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-normal bg-slate-100 text-slate-600 border-slate-200">
                                                        {doc.type}
                                                    </Badge>
                                                    <span className="text-xs text-slate-400">•</span>
                                                    <span className="text-xs text-slate-500">
                                                        {dayjs(doc.created_at).fromNow()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const StatsCard = ({ title, value, icon: Icon, color, bg }) => (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
                </div>
                <div className={cn("p-3 rounded-2xl", bg)}>
                    <Icon size={24} className={color} weight="duotone" />
                </div>
            </div>
        </CardContent>
    </Card>
);

const QuickActionCard = ({ to, label, icon: Icon, color, bg }) => (
    <Link to={to} className="block group">
        <Card className="h-full border-slate-200 shadow-sm group-hover:shadow-md group-hover:border-teal-500/30 transition-all duration-200 overflow-hidden">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-200", bg)}>
                    <Icon size={28} className={cn("transition-colors duration-200", color)} weight="duotone" />
                </div>
                <span className="font-semibold text-slate-700 group-hover:text-teal-700 transition-colors">{label}</span>
            </CardContent>
        </Card>
    </Link>
);

const EmptyState = ({ icon: Icon, message, desc }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Icon size={32} className="text-slate-300" weight="duotone" />
        </div>
        <h3 className="text-sm font-medium text-slate-900 mb-1">{message}</h3>
        <p className="text-xs text-slate-500 max-w-[200px]">{desc}</p>
    </div>
);

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed };
};

export default connect(mapStateToProps, { toggleCollapsedNav })(Dashboard);