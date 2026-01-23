import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Bell,
    Folder,
    Calendar,
    Plus,
    ArrowRight,
    Clock,
    BookOpen,
    TrendingUp
} from 'react-feather';
import dayjs from '../../../lib/dayjs';
import { toggleCollapsedNav } from '../../../redux/action/Theme';
import { supabase } from '../../../configs/supabaseClient';

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const ResponsiveDashboard = ({ toggleCollapsedNav }) => {
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

    // Stats cards configuration
    const statsCards = [
        {
            label: 'Documents',
            value: stats.totalDocuments,
            icon: <FileText size={22} />,
            bgColor: '#dbeafe',
            textColor: '#2563eb'
        },
        {
            label: 'Reminders',
            value: stats.upcomingReminders,
            icon: <Bell size={22} />,
            bgColor: '#fef3c7',
            textColor: '#d97706'
        },
        {
            label: 'Activity',
            value: stats.recentActivity,
            icon: <TrendingUp size={22} />,
            bgColor: '#d1fae5',
            textColor: '#059669'
        }
    ];

    // Quick actions configuration
    const quickActions = [
        {
            path: '/apps/ai/create-doc',
            icon: <FileText size={28} />,
            label: 'Create Document',
            bgColor: '#dbeafe',
            iconColor: '#2563eb'
        },
        {
            path: '/library',
            icon: <Folder size={28} />,
            label: 'View Library',
            bgColor: '#d1fae5',
            iconColor: '#059669'
        },
        {
            path: '/reminders',
            icon: <Bell size={28} />,
            label: 'Reminders',
            bgColor: '#fef3c7',
            iconColor: '#d97706'
        },
        {
            path: '/apps/calendar',
            icon: <Calendar size={28} />,
            label: 'Calendar',
            bgColor: '#cffafe',
            iconColor: '#0891b2'
        }
    ];

    // Styles
    const styles = {
        container: {
            padding: '1.5rem 1rem',
            paddingBottom: '6rem',
            maxWidth: '1400px',
            margin: '0 auto'
        },
        header: {
            marginBottom: '1.5rem'
        },
        headerFlex: {
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: '1rem',
            width: '100%'
        },
        headerText: {
            flex: '1 1 auto',
            minWidth: 0
        },
        title: {
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            fontWeight: 700,
            color: 'var(--color-text-primary, #0f172a)',
            margin: 0
        },
        subtitle: {
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary, #475569)',
            marginTop: '0.25rem'
        },
        createBtn: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            fontWeight: 500,
            fontSize: '0.875rem',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
            textDecoration: 'none',
            border: 'none',
            cursor: 'pointer',
            minHeight: '44px',
            whiteSpace: 'nowrap',
            flexShrink: 0
        },
        statsGrid: {
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr',
            marginBottom: '1.5rem'
        },
        statCard: {
            backgroundColor: 'var(--color-surface, #ffffff)',
            borderRadius: '1rem',
            border: '1px solid var(--color-border-subtle, #f1f5f9)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
            padding: '1.25rem',
            transition: 'all 0.25s ease'
        },
        statCardInner: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        },
        statIconWrap: {
            width: '3rem',
            height: '3rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        statLabel: {
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-text-muted, #94a3b8)',
            fontWeight: 500
        },
        statValue: {
            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 700,
            color: 'var(--color-text-primary, #0f172a)',
            marginTop: '0.125rem'
        },
        sectionHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem'
        },
        sectionTitle: {
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--color-text-primary, #0f172a)'
        },
        quickActionsGrid: {
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(2, 1fr)',
            marginBottom: '1.5rem'
        },
        actionCard: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            backgroundColor: 'var(--color-surface, #ffffff)',
            borderRadius: '1rem',
            border: '1px solid var(--color-border-subtle, #f1f5f9)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            minHeight: '120px',
            textDecoration: 'none',
            transition: 'all 0.25s ease'
        },
        actionIconWrap: {
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem'
        },
        actionLabel: {
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--color-text-primary, #0f172a)',
            textAlign: 'center'
        },
        contentSplit: {
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: '1fr'
        },
        contentCard: {
            backgroundColor: 'var(--color-surface, #ffffff)',
            borderRadius: '1rem',
            border: '1px solid var(--color-border-subtle, #f1f5f9)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
            overflow: 'hidden'
        },
        cardHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--color-border, #e2e8f0)'
        },
        cardTitle: {
            fontWeight: 600,
            color: 'var(--color-text-primary, #0f172a)'
        },
        viewAllLink: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.875rem',
            color: '#2563eb',
            textDecoration: 'none'
        },
        listItem: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem',
            padding: '1rem',
            borderBottom: '1px solid var(--color-border, #e2e8f0)',
            transition: 'background-color 0.2s'
        },
        listIconWrap: {
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        listItemTitle: {
            fontWeight: 500,
            color: 'var(--color-text-primary, #0f172a)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        listItemSub: {
            fontSize: '0.875rem',
            color: 'var(--color-text-muted, #94a3b8)',
            marginTop: '0.125rem'
        },
        emptyState: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            textAlign: 'center'
        },
        emptyIcon: {
            color: 'var(--color-text-muted, #94a3b8)',
            opacity: 0.4,
            marginBottom: '0.75rem'
        },
        emptyText: {
            color: 'var(--color-text-muted, #94a3b8)'
        },
        badge: {
            flexShrink: 0,
            padding: '0.125rem 0.5rem',
            borderRadius: '0.375rem',
            backgroundColor: 'var(--color-surface-hover, #f1f5f9)',
            fontSize: '0.75rem',
            color: 'var(--color-text-muted, #94a3b8)'
        }
    };

    // Responsive styles
    const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(min-width: 640px)') : { matches: false };
    const isTabletUp = mediaQuery.matches;
    const mediaQueryLg = typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)') : { matches: false };
    const isDesktop = mediaQueryLg.matches;

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            style={styles.container}
        >
            {/* Page Header */}
            <motion.div variants={itemVariants} style={styles.header}>
                <div style={styles.headerFlex}>
                    <div style={styles.headerText}>
                        <h1 style={styles.title}>Dashboard</h1>
                        <p style={styles.subtitle}>Welcome to Sisgate PRO Hub</p>
                    </div>
                    <Link to="/apps/ai/create-doc" style={styles.createBtn}>
                        <Plus size={18} />
                        <span>Create Document</span>
                    </Link>
                </div>
            </motion.div>

            {/* Statistics Cards */}
            <motion.div
                variants={itemVariants}
                style={{
                    ...styles.statsGrid,
                    gridTemplateColumns: isTabletUp ? 'repeat(2, 1fr)' : '1fr',
                    ...(isDesktop && { gridTemplateColumns: 'repeat(3, 1fr)' })
                }}
            >
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        whileHover={{ y: -4 }}
                        style={styles.statCard}
                    >
                        <div style={styles.statCardInner}>
                            <div style={{ ...styles.statIconWrap, backgroundColor: stat.bgColor }}>
                                <span style={{ color: stat.textColor }}>{stat.icon}</span>
                            </div>
                            <div>
                                <p style={styles.statLabel}>{stat.label}</p>
                                <p style={styles.statValue}>{loading ? '—' : stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} style={{ marginBottom: '1.5rem' }}>
                <div style={styles.sectionHeader}>
                    <h2 style={styles.sectionTitle}>Quick Actions</h2>
                </div>
                <div style={{
                    ...styles.quickActionsGrid,
                    ...(isDesktop && { gridTemplateColumns: 'repeat(4, 1fr)' })
                }}>
                    {quickActions.map((action, index) => (
                        <Link
                            key={index}
                            to={action.path}
                            style={styles.actionCard}
                        >
                            <div style={{ ...styles.actionIconWrap, backgroundColor: action.bgColor }}>
                                <span style={{ color: action.iconColor }}>{action.icon}</span>
                            </div>
                            <span style={styles.actionLabel}>{action.label}</span>
                        </Link>
                    ))}
                </div>
            </motion.div>

            {/* Content Split - Reminders & Documents */}
            <motion.div
                variants={itemVariants}
                style={{
                    ...styles.contentSplit,
                    ...(isDesktop && { gridTemplateColumns: 'repeat(2, 1fr)' })
                }}
            >
                {/* Upcoming Reminders */}
                <div style={styles.contentCard}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Upcoming Reminders</h3>
                        <Link to="/reminders" style={styles.viewAllLink}>
                            <span>View all</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div>
                        {loading ? (
                            <div style={styles.emptyState}>
                                <span>Loading...</span>
                            </div>
                        ) : reminders.length === 0 ? (
                            <div style={styles.emptyState}>
                                <Bell size={40} style={styles.emptyIcon} />
                                <p style={styles.emptyText}>No upcoming reminders</p>
                            </div>
                        ) : (
                            reminders.map((reminder, idx) => (
                                <div key={idx} style={styles.listItem}>
                                    <div style={{ ...styles.listIconWrap, backgroundColor: '#fef3c7' }}>
                                        <Clock size={16} style={{ color: '#d97706' }} />
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <p style={styles.listItemTitle}>{reminder.title}</p>
                                        <p style={styles.listItemSub}>
                                            {dayjs(reminder.schedule_at).format('DD-MM-YYYY [at] h:mm A')}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Documents */}
                <div style={styles.contentCard}>
                    <div style={styles.cardHeader}>
                        <h3 style={styles.cardTitle}>Recent Documents</h3>
                        <Link to="/library" style={styles.viewAllLink}>
                            <span>View all</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div>
                        {loading ? (
                            <div style={styles.emptyState}>
                                <span>Loading...</span>
                            </div>
                        ) : documents.length === 0 ? (
                            <div style={styles.emptyState}>
                                <BookOpen size={40} style={styles.emptyIcon} />
                                <p style={styles.emptyText}>No documents yet</p>
                            </div>
                        ) : (
                            documents.map((doc, idx) => (
                                <div key={idx} style={styles.listItem}>
                                    <div style={{ ...styles.listIconWrap, backgroundColor: '#dbeafe' }}>
                                        <FileText size={16} style={{ color: '#2563eb' }} />
                                    </div>
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                                            <p style={styles.listItemTitle}>{doc.name}</p>
                                            <span style={styles.badge}>{doc.type}</span>
                                        </div>
                                        <p style={styles.listItemSub}>
                                            {doc.category} • {dayjs(doc.created_at).fromNow()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const mapStateToProps = ({ theme }) => {
    const { navCollapsed } = theme;
    return { navCollapsed };
};

export default connect(mapStateToProps, { toggleCollapsedNav })(ResponsiveDashboard);
