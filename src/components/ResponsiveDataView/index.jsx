import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, Pagination, Button } from 'react-bootstrap';
import { ChevronDown, ChevronUp, Grid, List } from 'react-feather';

/**
 * ResponsiveDataView - Displays data as Bento cards on mobile and Tables on desktop
 * 
 * @param {Array} data - Array of data items to display
 * @param {Array} columns - Column configuration [{key, label, render?, width?}]
 * @param {Function} renderCard - Custom render function for mobile card view
 * @param {Function} renderTableRow - Custom render function for table row
 * @param {String} keyField - Field to use as unique key (default: 'id')
 * @param {Object} emptyState - { icon, title, description }
 * @param {Boolean} loading - Loading state
 * @param {Number} itemsPerPage - Items per page (default: 10)
 * @param {Function} onItemClick - Callback when item is clicked
 * @param {Boolean} allowViewToggle - Show toggle button for view type
 */
const ResponsiveDataView = ({
    data = [],
    columns = [],
    renderCard,
    renderTableRow,
    keyField = 'id',
    emptyState = { icon: null, title: 'No data found', description: '' },
    loading = false,
    itemsPerPage = 10,
    onItemClick,
    allowViewToggle = false,
    className = ''
}) => {
    const [windowWidth, setWindowWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [viewMode, setViewMode] = useState('auto'); // 'auto', 'card', 'table'

    // Update window width on resize
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isDesktop = windowWidth >= 1024;

    // Determine actual view based on mode
    const showTable = viewMode === 'table' || (viewMode === 'auto' && isDesktop);
    const showCards = viewMode === 'card' || (viewMode === 'auto' && !isDesktop);

    // Pagination logic
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Reset to page 1 when data changes
    useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);

    // Styles
    const styles = {
        container: {
            width: '100%'
        },
        viewToggle: {
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            justifyContent: 'flex-end'
        },
        toggleBtn: (active) => ({
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: active ? '2px solid #3b82f6' : '1px solid #e2e8f0',
            backgroundColor: active ? '#eff6ff' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '40px',
            minHeight: '40px'
        }),
        cardsGrid: {
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
        },
        card: {
            backgroundColor: 'var(--color-surface, #ffffff)',
            borderRadius: '1rem',
            border: '1px solid var(--color-border-subtle, #f1f5f9)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03)',
            padding: '1rem',
            transition: 'all 0.25s ease',
            cursor: onItemClick ? 'pointer' : 'default'
        },
        cardHover: {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
            transform: 'translateY(-2px)'
        },
        tableContainer: {
            overflowX: 'auto',
            borderRadius: '0.75rem',
            border: '1px solid var(--color-border, #e2e8f0)',
            backgroundColor: 'var(--color-surface, #ffffff)'
        },
        emptyState: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: 'var(--color-surface, #ffffff)',
            borderRadius: '1rem',
            border: '1px solid var(--color-border-subtle, #f1f5f9)'
        },
        emptyIcon: {
            color: 'var(--color-text-muted, #94a3b8)',
            opacity: 0.5,
            marginBottom: '1rem'
        },
        emptyTitle: {
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--color-text-primary, #0f172a)',
            marginBottom: '0.5rem'
        },
        emptyDescription: {
            fontSize: '0.875rem',
            color: 'var(--color-text-muted, #94a3b8)'
        },
        loadingContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            backgroundColor: 'var(--color-surface, #ffffff)',
            borderRadius: '1rem'
        },
        paginationContainer: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: '1.5rem'
        }
    };

    // Default card renderer
    const defaultRenderCard = (item, index) => (
        <div style={styles.card}>
            {columns.map((col) => (
                <div key={col.key} style={{ marginBottom: '0.5rem' }}>
                    <span style={{
                        fontSize: '0.75rem',
                        color: 'var(--color-text-muted, #94a3b8)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {col.label}
                    </span>
                    <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-primary, #0f172a)',
                        fontWeight: 500
                    }}>
                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </div>
                </div>
            ))}
        </div>
    );

    // Default table row renderer
    const defaultRenderTableRow = (item, index) => (
        <tr
            key={item[keyField]}
            onClick={() => onItemClick && onItemClick(item)}
            style={{ cursor: onItemClick ? 'pointer' : 'default' }}
        >
            {columns.map((col) => (
                <td key={col.key} style={{ width: col.width }}>
                    {col.render ? col.render(item[col.key], item) : item[col.key]}
                </td>
            ))}
        </tr>
    );

    // Loading state
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // Empty state
    if (data.length === 0) {
        return (
            <div style={styles.emptyState}>
                {emptyState.icon && (
                    <div style={styles.emptyIcon}>
                        {emptyState.icon}
                    </div>
                )}
                <div style={styles.emptyTitle}>{emptyState.title}</div>
                {emptyState.description && (
                    <div style={styles.emptyDescription}>{emptyState.description}</div>
                )}
            </div>
        );
    }

    return (
        <div style={styles.container} className={className}>
            {/* View Toggle (Optional) */}
            {allowViewToggle && (
                <div style={styles.viewToggle}>
                    <button
                        style={styles.toggleBtn(showCards)}
                        onClick={() => setViewMode('card')}
                        title="Card View"
                    >
                        <Grid size={18} />
                    </button>
                    <button
                        style={styles.toggleBtn(showTable)}
                        onClick={() => setViewMode('table')}
                        title="Table View"
                    >
                        <List size={18} />
                    </button>
                </div>
            )}

            {/* Card View (Mobile) */}
            {showCards && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles.cardsGrid}
                >
                    <AnimatePresence>
                        {currentData.map((item, index) => (
                            <motion.div
                                key={item[keyField]}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2, delay: index * 0.05 }}
                                whileHover={styles.cardHover}
                                onClick={() => onItemClick && onItemClick(item)}
                            >
                                {renderCard ? renderCard(item, index) : defaultRenderCard(item, index)}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* Table View (Desktop) */}
            {showTable && (
                <div style={styles.tableContainer} className="table-advance-container">
                    <Table responsive borderless className="nowrap table-advance mb-0">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} style={{ width: col.width }} className={col.className}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {currentData.map((item, index) =>
                                renderTableRow ? renderTableRow(item, index) : defaultRenderTableRow(item, index)
                            )}
                        </tbody>
                    </Table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={styles.paginationContainer}>
                    <Pagination>
                        <Pagination.Prev
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        />
                        {[...Array(totalPages)].map((_, i) => (
                            <Pagination.Item
                                key={i + 1}
                                active={i + 1 === currentPage}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        />
                    </Pagination>
                </div>
            )}
        </div>
    );
};

export default ResponsiveDataView;
