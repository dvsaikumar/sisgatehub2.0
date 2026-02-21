/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { supabase } from '../../configs/supabaseClient';
import dayjs from '../../lib/dayjs';
import { motion, Variants } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { usePreferencesStore, WALLPAPER_MAP, WIDGET_THEME_MAP } from '../../stores/preferences-store';

// Components
import StatCard from './components/StatCard';
import RecentDocuments from './components/RecentDocuments';
import UpcomingReminders from './components/UpcomingReminders';
import RecentActivity from './components/RecentActivity';
import { StatCardSkeleton } from './components/DashboardSkeleton';

// Icons
import {
    FileText,
    Bell,
    ChartLineUp,
    TrendUp,
    TrendDown,
    CalendarCheck,
    Sun,
    Moon,
    Database,
    Users,
    Clock,
    SunHorizon
} from '@phosphor-icons/react';

import { DashboardStats, Document, Reminder } from '../../models';

const Dashboard: React.FC = () => {
    const dispatch = useDispatch();
    const [currentTime, setCurrentTime] = useState(dayjs());

    // Personalization preferences
    const dashboardWallpaper = usePreferencesStore((s) => s.dashboardWallpaper);
    const greetingMessage = usePreferencesStore((s) => s.greetingMessage);
    const widgetColorTheme = usePreferencesStore((s) => s.widgetColorTheme);
    const widgetTheme = WIDGET_THEME_MAP[widgetColorTheme];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        dispatch(toggleCollapsedNav(false));
    }, [dispatch]);

    // React Query: Fetch Dashboard Data
    const { data, isLoading } = useQuery({
        queryKey: ['dashboardData'],
        queryFn: async () => {
            const now = new Date().toISOString();

            // 1. Get Auth User first to get ID
            const { data: { user } } = await supabase.auth.getUser();

            // 2. Parallel requests (Profile + Data)
            const [
                { data: profile },
                { data: remindersData },
                { data: docsData },
                { count: docCount },
                { count: reminderCount },
                { count: activityCount },
                { count: teamCount },
                { count: completedRemindersCount }
            ] = await Promise.all([
                user ? supabase.from('user_profiles').select('full_name').eq('id', user.id).maybeSingle() : Promise.resolve({ data: null }),
                supabase.from('app_reminders').select('*').gte('schedule_at', now).order('schedule_at', { ascending: true }).limit(8),
                supabase.from('app_documents').select('*').order('created_at', { ascending: false }).limit(8),
                supabase.from('app_documents').select('*', { count: 'exact', head: true }),
                supabase.from('app_reminders').select('*', { count: 'exact', head: true }).gte('schedule_at', now),
                supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
                supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
                supabase.from('app_reminders').select('*', { count: 'exact', head: true }).eq('is_completed', true)
            ]);

            const totalReminders = (reminderCount || 0) + (completedRemindersCount || 0);
            const efficiencyScore = totalReminders > 0
                ? Math.round(((completedRemindersCount || 0) / totalReminders) * 100)
                : 100;

            const ESTIMATED_DOC_SIZE_MB = 2.5;
            const storageEstimate = ((docCount || 0) * ESTIMATED_DOC_SIZE_MB).toFixed(1) + ' MB';

            return {
                user,
                profile,
                reminders: (remindersData as Reminder[]) || [],
                documents: (docsData as Document[]) || [],
                stats: {
                    totalDocuments: docCount || 0,
                    upcomingReminders: reminderCount || 0,
                    recentActivity: activityCount || 0,
                    storageUsed: storageEstimate,
                    teamMemberCount: teamCount || 1,
                    efficiency: efficiencyScore
                } as DashboardStats
            };
        }
    });

    const isDataLoading = isLoading || !data;
    const stats = data?.stats || {
        totalDocuments: 0,
        upcomingReminders: 0,
        recentActivity: 0,
        storageUsed: '0 MB',
        teamMemberCount: 1,
        efficiency: 100
    };

    // Greeting Name Logic: Profile > Metadata > Email > Fallback
    const user = data?.user;
    const profile = data?.profile;
    const displayName = profile?.full_name?.split(' ')[0]
        || user?.user_metadata?.full_name?.split(' ')[0]
        || user?.email?.split('@')[0]
        || 'Admin';

    // Greeting Time Logic
    const getGreeting = () => {
        if (greetingMessage) return { text: greetingMessage, icon: SunHorizon, color: 'text-amber-500' };
        const hour = dayjs().hour();
        if (hour < 12) return { text: `Good Morning, ${displayName}`, icon: SunHorizon, color: 'text-amber-500' };
        if (hour < 18) return { text: `Good Afternoon, ${displayName}`, icon: Sun, color: 'text-orange-500' };
        return { text: `Good Evening, ${displayName}`, icon: Moon, color: 'text-indigo-400' };
    };
    const greeting = getGreeting();

    // Animation variants
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } }
    };

    const statsData = [
        {
            title: 'Total Docs',
            value: stats.totalDocuments,
            icon: FileText,
            bg: 'bg-indigo-50',
            color: 'text-indigo-600',
            trend: '+12%',
            trendIcon: TrendUp,
            trendColor: 'text-emerald-700'
        },
        {
            title: 'Reminders',
            value: stats.upcomingReminders || 0,
            icon: Bell,
            bg: 'bg-amber-50',
            color: 'text-amber-700',
            trend: '+5',
            trendIcon: CalendarCheck,
            trendColor: 'text-amber-700'
        },
        {
            title: 'Activity',
            value: stats.recentActivity,
            icon: ChartLineUp,
            bg: 'bg-emerald-50',
            color: 'text-emerald-700',
            trend: '+24%',
            trendIcon: TrendUp,
            trendColor: 'text-emerald-700'
        },
        {
            title: 'Storage',
            value: stats.storageUsed,
            icon: Database,
            bg: 'bg-purple-50',
            color: 'text-purple-700',
            trend: '+8%',
            trendIcon: TrendUp,
            trendColor: 'text-purple-700'
        },
        {
            title: 'Team',
            value: stats.teamMemberCount,
            icon: Users,
            bg: 'bg-cyan-50',
            color: 'text-cyan-700',
            trend: '+1',
            trendIcon: TrendUp, // New user
            trendColor: 'text-emerald-700'
        },
        {
            title: 'Efficiency',
            value: `${stats.efficiency}%`,
            icon: TrendUp,
            bg: 'bg-blue-50',
            color: 'text-blue-700',
            trend: '-2%',
            trendIcon: TrendDown,
            trendColor: 'text-rose-600'
        }
    ];

    return (
        <motion.div
            className="p-4 md:p-6 lg:p-8 max-w-[1920px] mx-auto min-h-screen font-sans"
            style={{
                background: dashboardWallpaper !== 'none'
                    ? WALLPAPER_MAP[dashboardWallpaper]
                    : undefined,
                backgroundColor: dashboardWallpaper === 'none' ? 'rgb(248 250 252 / 0.3)' : undefined,
            }}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Premium Header */}
            <motion.header variants={itemVariants} className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <greeting.icon size={24} weight="duotone" className={greeting.color} />
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{greeting.text}</h1>
                    </div>
                    <p className="text-slate-600 font-medium">Here's what's happening in your workspace today.</p>
                </div>

                {/* Local Time Widget - Capsule 11:08 Style */}
                <div className="hidden md:flex items-center gap-5">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Clock size={24} weight="duotone" className="text-slate-400" />
                            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{currentTime.format('HH:mm')}</h1>
                        </div>
                        <p className="text-slate-600 font-medium">{dayjs().format('MMMM D, YYYY')}</p>
                    </div>
                </div>
            </motion.header>

            <div className="flex flex-col gap-6">

                {/* 1. Stats Row (4 Columns) */}
                {/* 1. Stats Row (Unified Strip) */}
                <motion.div
                    variants={itemVariants}
                    className={`${widgetTheme.bg} rounded-xl shadow-xs border border-slate-200 flex flex-col lg:flex-row`}
                    style={{ borderColor: widgetTheme.accent + '22' }}
                >
                    {isDataLoading ? (
                        <>
                            <StatCardSkeleton /><StatCardSkeleton />
                            <StatCardSkeleton /><StatCardSkeleton />
                            <StatCardSkeleton /><StatCardSkeleton />
                        </>
                    ) : (
                        statsData.map((stat, idx) => (
                            <motion.div
                                variants={itemVariants}
                                key={idx}
                                className="flex-1 border-b lg:border-b-0 lg:border-r border-slate-200 last:border-0">
                                <StatCard {...stat} />
                            </motion.div>
                        ))
                    )}
                </motion.div>

                {/* 2. Main Content Grid */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[500px]">

                    {/* Recent Documents (6 Cols - 50%) */}
                    <div className="xl:col-span-6 flex flex-col h-full">
                        <RecentDocuments
                            documents={data?.documents || []}
                            loading={isDataLoading}
                            itemVariants={itemVariants}
                        />
                    </div>

                    {/* Upcoming Reminders (3 Cols - 25%) */}
                    <div className="xl:col-span-3 flex flex-col h-full">
                        <UpcomingReminders
                            reminders={data?.reminders || []}
                            loading={isDataLoading}
                            itemVariants={itemVariants}
                        />
                    </div>

                    {/* Recent Activity (3 Cols - 25%) */}
                    <div className="xl:col-span-3 flex flex-col h-full">
                        <RecentActivity />
                    </div>

                </motion.div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
