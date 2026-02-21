import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    // App Features
    FolderOpen, FileText, Robot, CalendarDots, ChatCircleDots,
    Kanban, EnvelopeSimple, Invoice, AddressBook, HardDrives,
    Article, ImageSquare, Plugs, ClockCounterClockwise,
    ChartLineUp,
    // Policies
    Scroll, Scales, Handshake,
    // Tech Stack
    Code, Database, ChartBar, PaintBrush,
    // Security
    ShieldCheck, LockKey, ListChecks, Key, LockSimple,
    // GDPR
    IdentificationBadge, UserCircleGear, Certificate,
    HourglassMedium, Airplane, Cookie,
    // UI
    MagnifyingGlass, CaretDown, Sparkle, Lightning, Eye,
    Cube, ArrowDown
} from '@phosphor-icons/react';
import './ExploreFeatures.css';

// ─── Feature Data ───────────────────────────────────────────
const SECTIONS = [
    { id: 'features', label: 'App Features', icon: Cube },
    { id: 'policies', label: 'Policies', icon: Scroll },
    { id: 'tech', label: 'Tech Stack', icon: Code },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'gdpr', label: 'GDPR', icon: Certificate },
];

const FEATURES_DATA = [
    {
        icon: FolderOpen,
        title: 'Document Library',
        desc: 'A centralized hub to organize, store, and retrieve all your documents. Filter by category, toggle between grid and list views, and preview files instantly with our built-in drawer — no downloads required.',
        tags: ['Library', 'PDF', 'DOCX', 'Preview', 'Categories'],
        details: [
            'Category & subcategory folder organization',
            'Grid and list view toggles with persistent preference',
            'Inline document preview with full-screen modal',
            'PDF & DOCX generation (jsPDF, docxtemplater)',
            'Drag-and-drop file uploads via react-dropzone',
            'Breadcrumb navigation for deep folder structures',
            'Bulk selection and batch operations',
        ],
        highlights: ['Category Filters', 'Grid & List Views', 'Instant Preview'],
        image: '/images/features/document-library.png',
        bento: 'span-2',
    },
    {
        icon: Robot,
        title: 'AI Document Creation',
        desc: 'Leverage AI to generate professional documents from pre-built templates. Configure goals, select frameworks, and produce polished content in seconds with rich text editing.',
        tags: ['AI', 'Templates', 'Automation', 'Rich Text'],
        details: [
            'Pre-built document templates library',
            'Goal-based document generation with AI',
            'Multiple AI framework configurations',
            'Rich text editing with TinyMCE & Quill',
            'Inline preview before exporting',
            'Export to PDF, DOCX, and plain text',
        ],
        highlights: ['AI-Powered', 'Template Library', 'Rich Editor'],
        image: '/images/features/ai-document.png',
    },
    {
        icon: CalendarDots,
        title: 'Reminders & Calendar',
        desc: 'Stay on top of deadlines with a full-featured calendar. Create recurring events, share calendars with teammates, and receive automated email reminders powered by Supabase Edge Functions.',
        tags: ['FullCalendar', 'Email', 'Scheduling', 'Recurring'],
        details: [
            'Day, week, month, and agenda views',
            'Recurring event patterns (daily, weekly, monthly)',
            'Email reminder notifications via Edge Functions',
            'Calendar sharing with role-based permissions',
            'Availability / busy-time visualization',
            'Color-coded calendars for project organization',
        ],
        highlights: ['Recurring Events', 'Email Alerts', 'Shared Calendars'],
        image: '/images/features/calendar-reminders.png',
    },
    {
        icon: HardDrives,
        title: 'File Manager',
        desc: 'Browse, upload, and organize all your files in a modern file manager. Supports grid and list layouts, drag-and-drop uploads, and real-time storage usage statistics at a glance.',
        tags: ['Storage', 'Upload', 'Grid', 'Media', 'Preview'],
        details: [
            'Grid and list view toggles',
            'Drag-and-drop multi-file uploads',
            'File previews for images, docs, and media',
            'Real-time storage usage indicators',
            'File type filtering and instant search',
            'Secure file URLs with signed tokens',
        ],
        highlights: ['Cloud Storage', 'Drag & Drop', 'Live Stats'],
        image: '/images/features/file-manager.png',
    },
    {
        icon: ClockCounterClockwise,
        title: 'Audit Logs',
        desc: 'Maintain a comprehensive, immutable record of every user action, route change, and data modification. Essential for compliance, debugging, and organizational transparency.',
        tags: ['Tracking', 'Compliance', 'Activity', 'Immutable'],
        details: [
            'Immutable audit trail for all operations',
            'Route change and navigation tracking',
            'User action logging with metadata & timestamps',
            'Exportable audit reports (CSV, PDF)',
            'Filterable by user, action type, and date range',
            'IP address and session tracking',
        ],
        highlights: ['Immutable Trail', 'Compliance Ready', 'Exportable'],
        image: '/images/features/audit-logs.png',
    },
    {
        icon: ChartLineUp,
        title: 'Dashboard & Analytics',
        desc: 'Your personalized command center. View real-time stats, interactive charts, and activity feeds. Customize wallpapers, widget colors, and enjoy time-of-day greetings that make every login personal.',
        tags: ['Charts', 'Stats', 'Customizable', 'Widgets', 'Live'],
        details: [
            'Real-time stat cards (docs, reminders, activity, storage)',
            'ApexCharts & AmCharts interactive visualizations',
            'Customizable wallpapers and widget color themes',
            'Time-of-day personalized greetings with user name',
            'Activity feed with recent actions',
            'Quick-access shortcuts to key features',
        ],
        highlights: ['Live Stats', 'Interactive Charts', 'Personalized'],
        image: '/images/features/dashboard-analytics.png',
        bento: 'span-2',
    },
];

const POLICIES_DATA = [
    {
        icon: Scales,
        title: 'Privacy Policy & GDPR Compliance',
        desc: 'Comprehensive data protection policy aligned with EU GDPR requirements.',
        tags: ['Data Protection', 'EU Regulation'],
        details: [
            'Data Controller identification (Sisgate Technologies Inc.)',
            'Types of data collected: Identity, Contact, Technical, Usage',
            'Purpose of data processing clearly documented',
            'Legal basis for processing (Contractual, Consent, Legitimate Interests)',
            'Data retention periods and deletion policies',
            'Third-party data sharing governance',
        ],
        highlights: ['GDPR Aligned', 'Data Rights', 'Retention Policies'],
        image: '/images/features/privacy-policy.png',
        bento: 'span-2',
    },
    {
        icon: Scroll,
        title: 'Terms of Service',
        desc: 'Terms governing use of the platform, SLAs, liability, and acceptable use.',
        tags: ['Legal', 'SLA', 'Usage'],
        details: [
            'Acceptance of terms upon sign-up',
            'Acceptable Use Policy with prohibited actions',
            '99.9% uptime SLA commitment',
            'Limitation of liability provisions',
            'Termination clauses and user rights',
        ],
        highlights: ['SLA 99.9%', 'Usage Policies', 'Legal Framework'],
        image: '/images/features/terms-of-service.png',
    },
    {
        icon: Handshake,
        title: 'Data Processing Agreement',
        desc: 'B2B-ready DPA covering subprocessors, data transfers, and breach notifications.',
        tags: ['DPA', 'B2B', 'Transfers'],
        details: [
            'Subprocessor management and transparency',
            'Standard Contractual Clauses (SCCs) for international transfers',
            'Technical and organizational security measures',
            'Data breach notification protocol',
            'Audit rights for data protection compliance',
        ],
        highlights: ['Subprocessors', 'SCCs', 'Breach Protocol'],
        image: '/images/features/data-processing.png',
    },
];

const TECH_DATA = [
    {
        icon: Code,
        title: 'Core Framework',
        desc: 'React 19 with Vite 7, moving to TypeScript. Robust SPA with component composition.',
        tags: ['React 19', 'Vite 7', 'TypeScript'],
        details: [
            'React 19 with Hooks, Suspense, and Concurrent Mode',
            'Vite 7 for lightning-fast HMR and build',
            'React Router for SPA navigation',
            'Migrating from JavaScript to TypeScript',
            'Zustand + TanStack Query replacing legacy Redux',
        ],
        highlights: ['React 19', 'Vite 7', 'TypeScript Migration'],
        image: '/images/features/core-framework.png',
        bento: 'span-2',
    },
    {
        icon: Database,
        title: 'Backend & Infrastructure',
        desc: 'Supabase BaaS with PostgreSQL, Edge Functions (Deno), and real-time subscriptions.',
        tags: ['Supabase', 'PostgreSQL', 'Deno'],
        details: [
            'Supabase for Auth, Storage, and Realtime',
            'PostgreSQL with Row Level Security (RLS)',
            'Edge Functions on Deno runtime (e.g., send-reminder-email)',
            'SDK: @supabase/supabase-js',
        ],
        highlights: ['Supabase BaaS', 'PostgreSQL + RLS', 'Edge Functions'],
        image: '/images/features/backend-infra.png',
    },
    {
        icon: ChartBar,
        title: 'Data Visualization',
        desc: 'Rich charting with ApexCharts, AmCharts, and FullCalendar for scheduling.',
        tags: ['ApexCharts', 'AmCharts', 'FullCalendar'],
        details: [
            'ApexCharts for line, bar, and pie charts',
            'AmCharts 5 with geodata for map visualizations',
            'FullCalendar with DayGrid, TimeGrid, and Interaction',
            'Frappe Gantt for project timeline views',
        ],
        highlights: ['ApexCharts', 'AmCharts 5', 'FullCalendar'],
        image: '/images/features/data-visualization.png',
    },
    {
        icon: PaintBrush,
        title: 'UI & Design System',
        desc: 'Tailwind CSS v4, Framer Motion animations, Phosphor Icons, and variable fonts.',
        tags: ['Tailwind v4', 'Framer Motion', 'Phosphor'],
        details: [
            'Tailwind CSS v4 utility-first workflow',
            'Framer Motion for smooth page transitions and micro-animations',
            'Phosphor Icons (duotone weight)',
            'Bootstrap 5 (legacy, being phased out)',
            'SASS/SCSS for legacy style maintenance',
            'Variable font system (Inter) for fluid typography',
        ],
        highlights: ['Tailwind v4', 'Framer Motion', 'Phosphor Icons'],
        image: '/images/features/ui-design-system.png',
    },
];

const SECURITY_DATA = [
    {
        icon: ShieldCheck,
        title: 'Row Level Security (RLS)',
        desc: 'PostgreSQL RLS policies ensure data isolation at the database level — no server-side bypass possible.',
        tags: ['PostgreSQL', 'Multi-tenant', 'Isolation'],
        details: [
            'Fine-grained row-level access policies per table',
            'Tenant data isolation enforced at the database engine level',
            'Policies applied automatically on every query',
        ],
        highlights: ['Database-Level', 'Multi-Tenant', 'Auto-Applied'],
        image: '/images/features/row-level-security.png',
        bento: 'span-2',
    },
    {
        icon: LockKey,
        title: 'Authentication & Sessions',
        desc: 'Supabase Auth with secure session management, auto-refresh tokens, and lock screens.',
        tags: ['Auth', 'JWT', 'Sessions'],
        details: [
            'Email/password and social provider login',
            'JWT-based session tokens with auto-refresh',
            'SessionManager component for idle timeout handling',
            'Lock screen and password reset flows',
        ],
        highlights: ['JWT Tokens', 'Auto-Refresh', 'Lock Screen'],
        image: '/images/features/auth-sessions.png',
    },
    {
        icon: ListChecks,
        title: 'Comprehensive Audit Logging',
        desc: 'Every user action, page navigation, and data mutation is recorded in immutable audit logs.',
        tags: ['Audit Trail', 'Compliance', 'Immutable'],
        details: [
            'RouteTracker component logs all navigation events',
            'Data change tracking with before/after snapshots',
            'Exportable audit reports for compliance reviews',
        ],
        highlights: ['Route Tracking', 'Data Snapshots', 'Exportable'],
        image: '/images/features/security-audit.png',
    },
    {
        icon: Key,
        title: 'Edge Function Security',
        desc: 'All serverless functions require JWT verification by default, preventing unauthorized access.',
        tags: ['JWT', 'Serverless', 'Authorization'],
        details: [
            'verify_jwt enabled by default on all Edge Functions',
            'Service role keys used only server-side',
            'Publishable API keys for client-side access',
        ],
        highlights: ['JWT Required', 'Service Keys', 'Publishable API'],
        image: '/images/features/edge-function-security.png',
    },
    {
        icon: LockSimple,
        title: 'Encryption & Transport',
        desc: 'TLS encryption in transit, AES-256 at rest, and secure credential management.',
        tags: ['TLS', 'AES-256', 'HTTPS'],
        details: [
            'All API communication over HTTPS/TLS 1.3',
            'Database encryption at rest (AES-256)',
            'Environment variables for secret management',
            'No credentials stored in client-side code',
        ],
        highlights: ['TLS 1.3', 'AES-256', 'No Client Secrets'],
        image: '/images/features/edge-function-security.png',
    },
];

const GDPR_DATA = [
    {
        icon: IdentificationBadge,
        title: 'Data Controller Identification',
        desc: 'Sisgate Technologies Inc. is clearly identified as the data controller with published contact details.',
        tags: ['Article 13', 'Transparency'],
        details: [
            'Controller: Sisgate Technologies Inc.',
            'Physical address and privacy email published',
            'Data Protection Officer contactable at dpo@sisgate.com',
        ],
        highlights: ['Transparency', 'DPO Contact', 'Published Address'],
        image: '/images/features/privacy-policy.png',
    },
    {
        icon: UserCircleGear,
        title: 'User Data Rights',
        desc: 'Full support for all GDPR Article 15–22 rights: access, rectification, erasure, portability, and objection.',
        tags: ['Article 15-22', 'Data Subject Rights'],
        details: [
            'Right to Access — request copies of personal data',
            'Right to Rectification — correct inaccurate data',
            'Right to Erasure ("Right to be Forgotten")',
            'Right to Restrict Processing',
            'Right to Data Portability — transfer data to another org',
            'Right to Object — opt out of processing',
        ],
        highlights: ['Access', 'Erasure', 'Portability'],
        image: '/images/features/terms-of-service.png',
        bento: 'span-2',
    },
    {
        icon: Certificate,
        title: 'Legal Basis for Processing',
        desc: 'Every data processing activity is mapped to a lawful basis under GDPR Article 6.',
        tags: ['Article 6', 'Lawful Basis'],
        details: [
            'Contractual Necessity for service delivery',
            'Explicit Consent for marketing communications',
            'Legitimate Interests for security and fraud prevention',
            'Legal Obligation for regulatory compliance',
        ],
        highlights: ['Article 6', 'Consent', 'Legitimate Interests'],
        image: '/images/features/data-processing.png',
    },
    {
        icon: HourglassMedium,
        title: 'Data Retention Policies',
        desc: 'Clear retention schedules with automatic anonymization after account deletion.',
        tags: ['Retention', 'Anonymization'],
        details: [
            'Active accounts: retained for account lifecycle duration',
            'Deleted accounts: data removed or anonymized within 30 days',
            'Legal hold exceptions documented',
        ],
        highlights: ['30-Day Deletion', 'Anonymization', 'Legal Hold'],
        image: '/images/features/security-audit.png',
    },
    {
        icon: Airplane,
        title: 'International Transfer Safeguards',
        desc: 'Standard Contractual Clauses (SCCs) ensure GDPR-compliant cross-border data transfers.',
        tags: ['SCCs', 'Cross-border', 'Adequacy'],
        details: [
            'EU Standard Contractual Clauses (SCCs) as primary mechanism',
            'Adequacy decisions respected where applicable',
            'Transfer Impact Assessments (TIA) conducted',
        ],
        highlights: ['SCCs', 'Adequacy Decisions', 'TIA Conducted'],
        image: '/images/features/data-processing.png',
    },
    {
        icon: Cookie,
        title: 'Cookie Policy & Consent',
        desc: 'Transparent cookie usage with browser-level control and consent management.',
        tags: ['Cookies', 'Consent', 'ePrivacy'],
        details: [
            'Session cookies for authentication and security',
            'Optional analytical cookies with user control',
            'Browser-based cookie preference management',
            'No third-party tracking cookies',
        ],
        highlights: ['No Tracking', 'Browser Control', 'Session Only'],
        image: '/images/features/privacy-policy.png',
    },
];

const ALL_SECTION_DATA = {
    features: FEATURES_DATA,
    policies: POLICIES_DATA,
    tech: TECH_DATA,
    security: SECURITY_DATA,
    gdpr: GDPR_DATA,
};

// ─── Animation Variants ─────────────────────────────────────
const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 60, damping: 14 },
    },
};

const heroVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// ─── Feature Card Component ─────────────────────────────────
const FeatureCard = ({ icon: Icon, title, desc, tags, details, section, bento, image, highlights }) => {
    const [open, setOpen] = useState(false);
    const isFeatured = bento === 'span-2';
    const bentoClass = bento ? ` ef-card--${bento}` : '';

    return (
        <motion.div
            variants={cardVariants}
            className={`ef-card ef-card--${section}${bentoClass}`}
            onClick={() => setOpen((p) => !p)}
            layout
        >
            {isFeatured ? (
                /* ─── Featured Card: side-by-side layout ─── */
                <div className="ef-card__split">
                    <div className="ef-card__split-content">
                        <div className="ef-card__header">
                            <div className={`ef-card__icon ef-card__icon--${section}`}>
                                <Icon size={24} weight="duotone" />
                            </div>
                            <CaretDown
                                size={16}
                                weight="bold"
                                className={`ef-card__chevron${open ? ' ef-card__chevron--open' : ''}`}
                            />
                        </div>
                        <h3 className="ef-card__title">{title}</h3>
                        <p className="ef-card__desc">{desc}</p>
                        {highlights?.length > 0 && (
                            <div className="ef-card__highlights">
                                {highlights.map((h) => (
                                    <span key={h} className="ef-card__highlight-chip">✦ {h}</span>
                                ))}
                            </div>
                        )}
                        {tags?.length > 0 && (
                            <div className="ef-card__tags">
                                {tags.map((t) => (
                                    <span key={t} className={`ef-tag ef-tag--${section}`}>{t}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    {image && (
                        <div className="ef-card__split-image">
                            <img src={image} alt={title} loading="lazy" />
                        </div>
                    )}
                </div>
            ) : (
                /* ─── Regular Card: clean icon-based ─── */
                <>
                    <div className="ef-card__header">
                        <div className={`ef-card__icon ef-card__icon--${section}`}>
                            <Icon size={24} weight="duotone" />
                        </div>
                        <CaretDown
                            size={16}
                            weight="bold"
                            className={`ef-card__chevron${open ? ' ef-card__chevron--open' : ''}`}
                        />
                    </div>
                    <h3 className="ef-card__title">{title}</h3>
                    <p className="ef-card__desc">{desc}</p>
                    {highlights?.length > 0 && (
                        <div className="ef-card__highlights">
                            {highlights.map((h) => (
                                <span key={h} className="ef-card__highlight-chip">✦ {h}</span>
                            ))}
                        </div>
                    )}
                    {tags?.length > 0 && (
                        <div className="ef-card__tags">
                            {tags.map((t) => (
                                <span key={t} className={`ef-tag ef-tag--${section}`}>{t}</span>
                            ))}
                        </div>
                    )}
                </>
            )}

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        className="ef-card__details"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        <div className="ef-card__details-inner">
                            <ul>
                                {details.map((d, i) => (
                                    <li key={i}>{d}</li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// ─── Section Icons Map ──────────────────────────────────────
const SECTION_ICONS = {
    features: Cube,
    policies: Scroll,
    tech: Code,
    security: ShieldCheck,
    gdpr: Certificate,
};

const SECTION_TITLES = {
    features: 'Application Features',
    policies: 'Policies & Legal',
    tech: 'Technology Stack',
    security: 'Security Features',
    gdpr: 'GDPR Compliance',
};

const SECTION_DESCS = {
    features: 'Everything you need to manage documents, communicate, and build — all in one platform.',
    policies: 'Transparent legal policies that govern usage, data processing, and your rights.',
    tech: 'A modern, performant stack built for speed, scalability, and developer experience.',
    security: 'Enterprise-grade security at every layer — from database to transport.',
    gdpr: 'Full compliance with the EU General Data Protection Regulation.',
};

// ─── Main Component ─────────────────────────────────────────
const ExploreFeatures = () => {
    const [activeTab, setActiveTab] = useState('features');
    const sectionRefs = useRef({});
    const tabBarRef = useRef(null);
    const containerRef = useRef(null);

    // IntersectionObserver for auto-highlighting tabs
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observers = [];
        const options = { root: container, rootMargin: '-30% 0px -60% 0px', threshold: 0 };

        SECTIONS.forEach(({ id }) => {
            const el = sectionRefs.current[id];
            if (!el) return;

            const observer = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) {
                    setActiveTab(id);
                }
            }, options);

            observer.observe(el);
            observers.push(observer);
        });

        return () => observers.forEach((o) => o.disconnect());
    }, []);

    const scrollToSection = (id) => {
        setActiveTab(id);
        const el = sectionRefs.current[id];
        const container = containerRef.current;
        if (el && container) {
            const offset = 80; // tab bar height
            const elTop = el.getBoundingClientRect().top;
            const containerTop = container.getBoundingClientRect().top;
            const scrollTop = container.scrollTop;
            const y = elTop - containerTop + scrollTop - offset;
            container.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const filteredSections = ALL_SECTION_DATA;

    const totalVisible = Object.values(filteredSections).reduce((sum, arr) => sum + arr.length, 0);

    return (
        <div className="explore-features-page" ref={containerRef}>
            {/* ─── Hero ─── */}
            <motion.section
                className="ef-hero"
                variants={heroVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="ef-hero__badge">
                    <Sparkle size={14} weight="fill" />
                    Sisgate PRO Hub 2.0
                </div>

                <h1 className="ef-hero__title">Explore Every Feature</h1>

                <p className="ef-hero__subtitle">
                    Discover the full power of your all-in-one productivity platform — from AI-powered
                    document creation to enterprise-grade GDPR compliance.
                </p>

                {/* Stats pills */}
                <div className="ef-stats-row">
                    <div className="ef-stat-pill">
                        <Lightning size={24} weight="duotone" style={{ color: '#4f46e5' }} />
                        <span className="ef-stat-pill__value">{FEATURES_DATA.length}</span>
                        <span className="ef-stat-pill__label">Features</span>
                    </div>
                    <div className="ef-stat-pill">
                        <ShieldCheck size={24} weight="duotone" style={{ color: '#059669' }} />
                        <span className="ef-stat-pill__value">{SECURITY_DATA.length}</span>
                        <span className="ef-stat-pill__label">Security Layers</span>
                    </div>
                    <div className="ef-stat-pill">
                        <Certificate size={24} weight="duotone" style={{ color: '#7c3aed' }} />
                        <span className="ef-stat-pill__value">{GDPR_DATA.length}</span>
                        <span className="ef-stat-pill__label">GDPR Controls</span>
                    </div>
                    <div className="ef-stat-pill">
                        <Cube size={24} weight="duotone" style={{ color: '#0891b2' }} />
                        <span className="ef-stat-pill__value">{TECH_DATA.length}</span>
                        <span className="ef-stat-pill__label">Tech Pillars</span>
                    </div>
                </div>
            </motion.section>

            {/* ─── Sticky Tabs ─── */}
            <nav className="ef-tabs" ref={tabBarRef}>
                <div className="ef-tabs__inner">
                    {SECTIONS.map(({ id, label, icon: TabIcon }) => (
                        <button
                            key={id}
                            data-section={id}
                            className={`ef-tab${activeTab === id ? ' ef-tab--active' : ''}`}
                            onClick={() => scrollToSection(id)}
                        >
                            <TabIcon size={20} weight={activeTab === id ? 'duotone' : 'regular'} />
                            {label}
                            {activeTab === id && (
                                <motion.div
                                    className="ef-tab__underline"
                                    layoutId="tab-underline"
                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </nav>

            {SECTIONS.map(({ id }, sectionIdx) => {
                const items = filteredSections[id];
                if (items.length === 0) return null;

                const SectionIcon = SECTION_ICONS[id];

                return (
                    <React.Fragment key={id}>
                        {sectionIdx > 0 && <div className="ef-divider" />}

                        <section
                            className="ef-section"
                            id={`ef-${id}`}
                            ref={(el) => (sectionRefs.current[id] = el)}
                        >
                            <div className="ef-section__header">
                                <div className={`ef-section__icon ef-section__icon--${id}`}>
                                    <SectionIcon size={22} weight="duotone" />
                                </div>
                                <h2 className="ef-section__title">{SECTION_TITLES[id]}</h2>
                            </div>
                            <p className="ef-section__desc">{SECTION_DESCS[id]}</p>

                            <motion.div
                                className={`ef-grid${id === 'features' ? ' ef-grid--features' : ''}`}
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.1 }}
                            >
                                {items.map((item, i) => (
                                    <FeatureCard key={i} {...item} section={id} />
                                ))}
                            </motion.div>
                        </section>
                    </React.Fragment>
                );
            })}

            {/* ─── Footer ─── */}
            <footer className="ef-footer">
                <p>
                    © {new Date().getFullYear()} Sisgate Technologies Inc. · Built with{' '}
                    <a href="https://react.dev" target="_blank" rel="noopener noreferrer">React</a>,{' '}
                    <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">Supabase</a> &{' '}
                    <a href="https://tailwindcss.com" target="_blank" rel="noopener noreferrer">Tailwind</a>
                </p>
            </footer>
        </div>
    );
};

export default ExploreFeatures;
