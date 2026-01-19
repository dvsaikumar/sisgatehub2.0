import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { toggleCollapsedNav } from '../../redux/action/Theme';
import { supabase } from '../../configs/supabaseClient';
import dayjs from '../../lib/dayjs';

// Icons
import {
    FileText,
    Bell,
    ChartLineUp,
    ArrowRight,
    Clock,
    Folder,
    CalendarBlank,
    Plus
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
            const { data: remindersData } = await supabase
                .from('app_reminders')
                .select('*')
                .gte('schedule_at', new Date().toISOString())
                .order('schedule_at', { ascending: true })
                .limit(5);

            const { data: docsData } = await supabase
                .from('app_documents')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

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

    // Simple professional styles
    const styles = {
        container: {
            padding: '24px',
            maxWidth: '1200px',
            margin: '0 auto',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
        },
        header: {
            marginBottom: '32px'
        },
        title: {
            fontSize: '24px',
            fontWeight: '600',
            color: '#1a1a2e',
            margin: '0 0 4px 0'
        },
        subtitle: {
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
        },
        statCard: {
            background: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        },
        statIcon: {
            width: '48px',
            height: '48px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        statLabel: {
            fontSize: '13px',
            color: '#6b7280',
            margin: '0 0 2px 0'
        },
        statValue: {
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a1a2e',
            margin: 0
        },
        actionsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginBottom: '32px'
        },
        actionCard: {
            background: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e5e7eb',
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
        },
        actionIcon: {
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        actionLabel: {
            fontSize: '13px',
            fontWeight: '500',
            color: '#374151',
            textAlign: 'center'
        },
        contentGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
        },
        card: {
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
        },
        cardHeader: {
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        cardTitle: {
            fontSize: '15px',
            fontWeight: '600',
            color: '#1a1a2e',
            margin: 0
        },
        cardLink: {
            fontSize: '13px',
            color: '#007D88',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontWeight: '500'
        },
        cardBody: {
            padding: '0'
        },
        listItem: {
            padding: '14px 20px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        listIcon: {
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        listContent: {
            flex: 1,
            minWidth: 0
        },
        listTitle: {
            fontSize: '14px',
            fontWeight: '500',
            color: '#1a1a2e',
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        listMeta: {
            fontSize: '12px',
            color: '#9ca3af',
            margin: '2px 0 0 0'
        },
        badge: {
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '4px',
            background: '#f3f4f6',
            color: '#6b7280',
            fontWeight: '500'
        },
        emptyState: {
            padding: '40px 20px',
            textAlign: 'center',
            color: '#9ca3af'
        },
        emptyIcon: {
            marginBottom: '12px',
            opacity: 0.5
        },
        emptyText: {
            fontSize: '14px',
            margin: 0
        }
    };

    const statsData = [
        { title: 'Documents', value: stats.totalDocuments, icon: FileText, bg: '#EEF2FF', color: '#4F46E5' },
        { title: 'Reminders', value: stats.upcomingReminders, icon: Bell, bg: '#FEF3C7', color: '#D97706' },
        { title: 'Activity', value: stats.recentActivity, icon: ChartLineUp, bg: '#D1FAE5', color: '#059669' }
    ];

    const quickActions = [
        { to: '/apps/ai/create-doc', label: 'Create Document', icon: Plus, bg: '#EEF2FF', color: '#4F46E5' },
        { to: '/library', label: 'Library', icon: Folder, bg: '#D1FAE5', color: '#059669' },
        { to: '/reminders', label: 'Reminders', icon: Bell, bg: '#FEF3C7', color: '#D97706' },
        { to: '/apps/calendar', label: 'Calendar', icon: CalendarBlank, bg: '#E0E7FF', color: '#4338CA' }
    ];

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h1 style={styles.title}>Dashboard</h1>
                <p style={styles.subtitle}>Welcome to Sisgate PRO Hub</p>
            </div>

            {/* Stats */}
            <div style={styles.statsGrid}>
                {statsData.map((stat, idx) => (
                    <div key={idx} style={styles.statCard}>
                        <div style={{ ...styles.statIcon, background: stat.bg }}>
                            <stat.icon size={24} weight="duotone" style={{ color: stat.color }} />
                        </div>
                        <div>
                            <p style={styles.statLabel}>{stat.title}</p>
                            <p style={styles.statValue}>{loading ? '—' : stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={styles.actionsGrid}>
                {quickActions.map((action, idx) => (
                    <Link key={idx} to={action.to} style={styles.actionCard}>
                        <div style={{ ...styles.actionIcon, background: action.bg }}>
                            <action.icon size={22} weight="duotone" style={{ color: action.color }} />
                        </div>
                        <span style={styles.actionLabel}>{action.label}</span>
                    </Link>
                ))}
            </div>

            {/* Content Grid */}
            <div style={styles.contentGrid}>
                {/* Reminders */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Upcoming Reminders</h3>
                        <Link to="/reminders" style={styles.cardLink}>
                            View All <ArrowRight size={14} weight="bold" />
                        </Link>
                    </div>
                    <div style={styles.cardBody}>
                        {loading ? (
                            <div style={styles.emptyState}>Loading...</div>
                        ) : reminders.length === 0 ? (
                            <div style={styles.emptyState}>
                                <Bell size={32} style={styles.emptyIcon} />
                                <p style={styles.emptyText}>No upcoming reminders</p>
                            </div>
                        ) : (
                            reminders.map((reminder, idx) => (
                                <div key={idx} style={styles.listItem}>
                                    <div style={{ ...styles.listIcon, background: '#FEF3C7' }}>
                                        <Clock size={18} weight="duotone" style={{ color: '#D97706' }} />
                                    </div>
                                    <div style={styles.listContent}>
                                        <p style={styles.listTitle}>{reminder.title}</p>
                                        <p style={styles.listMeta}>
                                            {dayjs(reminder.schedule_at).format('MMM D, YYYY • h:mm A')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Documents */}
                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Recent Documents</h3>
                        <Link to="/library" style={styles.cardLink}>
                            Browse All <ArrowRight size={14} weight="bold" />
                        </Link>
                    </div>
                    <div style={styles.cardBody}>
                        {loading ? (
                            <div style={styles.emptyState}>Loading...</div>
                        ) : documents.length === 0 ? (
                            <div style={styles.emptyState}>
                                <FileText size={32} style={styles.emptyIcon} />
                                <p style={styles.emptyText}>No documents yet</p>
                            </div>
                        ) : (
                            documents.map((doc, idx) => (
                                <div key={idx} style={styles.listItem}>
                                    <div style={{ ...styles.listIcon, background: '#EEF2FF' }}>
                                        <FileText size={18} weight="duotone" style={{ color: '#4F46E5' }} />
                                    </div>
                                    <div style={styles.listContent}>
                                        <p style={styles.listTitle}>{doc.name}</p>
                                        <p style={styles.listMeta}>
                                            <span style={styles.badge}>{doc.type}</span>
                                            {' • '}
                                            {dayjs(doc.created_at).fromNow()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed };
};

export default connect(mapStateToProps, { toggleCollapsedNav })(Dashboard);