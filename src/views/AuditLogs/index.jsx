import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Form, Button, Row, Col } from 'react-bootstrap';
import { supabase } from '../../configs/supabaseClient';
import useAuditLog, { AuditActionType, AuditResourceType, AuditActionStatus } from '../../hooks/useAuditLog';
import dayjs from '../../lib/dayjs';
import toast from 'react-hot-toast';

const AuditLogs = () => {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        actionType: '',
        resourceType: '',
        actionStatus: '',
        startDate: '',
        endDate: '',
        searchTerm: ''
    });
    const [isAdmin, setIsAdmin] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const logsPerPage = 50;

    useEffect(() => {
        checkAdminStatus();
        loadAuditLogs();
    }, [filters]);

    const checkAdminStatus = async () => {
        // Note: Admin check disabled since user_profiles doesn't have a role column
        // To enable admin access, add a 'role' column to user_profiles first
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            setIsAdmin(profile?.role === 'admin');
        }
        setIsAdmin(false); // Default to false until role column is added
    };

    const loadAuditLogs = async () => {
        setLoading(true);
        try {
            let result;

            if (isAdmin) {
                // Admin can see all logs
                result = await useAuditLog.getAllAuditLogs({
                    ...filters,
                    limit: logsPerPage * currentPage
                });
            } else {
                // Regular users see only their own logs
                result = await useAuditLog.getUserAuditLogs(30, logsPerPage * currentPage);
            }

            if (result.success) {
                let logs = result.data || [];

                // Apply client-side search filter
                if (filters.searchTerm) {
                    const searchLower = filters.searchTerm.toLowerCase();
                    logs = logs.filter(log =>
                        log.action_description?.toLowerCase().includes(searchLower) ||
                        log.resource_name?.toLowerCase().includes(searchLower) ||
                        log.user_email?.toLowerCase().includes(searchLower)
                    );
                }

                setAuditLogs(logs);
            } else {
                toast.error('Failed to load audit logs');
            }
        } catch (error) {
            console.error('Error loading audit logs:', error);
            toast.error('Error loading audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setFilters({
            actionType: '',
            resourceType: '',
            actionStatus: '',
            startDate: '',
            endDate: '',
            searchTerm: ''
        });
        setCurrentPage(1);
    };

    const getActionBadgeColor = (actionType) => {
        const colors = {
            CREATE: 'success',
            READ: 'info',
            UPDATE: 'warning',
            DELETE: 'danger',
            LOGIN: 'primary',
            LOGOUT: 'secondary',
            EXPORT: 'info',
            SEND_EMAIL: 'primary',
            SEND_REMINDER: 'primary'
        };
        return colors[actionType] || 'secondary';
    };

    const getStatusBadgeColor = (status) => {
        const colors = {
            success: 'success',
            failed: 'danger',
            pending: 'warning'
        };
        return colors[status] || 'secondary';
    };

    const exportLogs = () => {
        const csv = [
            ['Date', 'User', 'Action', 'Resource', 'Description', 'Status'].join(','),
            ...auditLogs.map(log => [
                dayjs(log.created_at).format('DD-MM-YYYY HH:mm:ss'),
                log.user_email || 'System',
                log.action_type,
                log.resource_type,
                `"${log.action_description || ''}"`,
                log.action_status
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${dayjs().format('DD-MM-YYYY')}.csv`;
        a.click();

        toast.success('Audit logs exported successfully');
    };

    return (
        <div className="audit-logs-container" style={{ padding: '20px' }}>
            <Card>
                <Card.Body>
                    <div style={{ marginBottom: '20px' }}>
                        <h2 style={{ marginBottom: '10px' }}>
                            🔍 Audit Logs
                            {isAdmin && <Badge bg="primary" style={{ marginLeft: '10px' }}>Admin View</Badge>}
                        </h2>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            Track all actions and changes in the system
                        </p>
                    </div>

                    {/* Filters */}
                    <Card style={{ marginBottom: '20px', backgroundColor: '#f8f9fa' }}>
                        <Card.Body>
                            <Row>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontSize: '12px', fontWeight: '600' }}>
                                            Search
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search logs..."
                                            value={filters.searchTerm}
                                            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontSize: '12px', fontWeight: '600' }}>
                                            Action Type
                                        </Form.Label>
                                        <Form.Select
                                            value={filters.actionType}
                                            onChange={(e) => handleFilterChange('actionType', e.target.value)}
                                        >
                                            <option value="">All Actions</option>
                                            {Object.keys(AuditActionType).map(key => (
                                                <option key={key} value={AuditActionType[key]}>
                                                    {AuditActionType[key]}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontSize: '12px', fontWeight: '600' }}>
                                            Resource Type
                                        </Form.Label>
                                        <Form.Select
                                            value={filters.resourceType}
                                            onChange={(e) => handleFilterChange('resourceType', e.target.value)}
                                        >
                                            <option value="">All Resources</option>
                                            {Object.keys(AuditResourceType).map(key => (
                                                <option key={key} value={AuditResourceType[key]}>
                                                    {AuditResourceType[key]}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontSize: '12px', fontWeight: '600' }}>
                                            Status
                                        </Form.Label>
                                        <Form.Select
                                            value={filters.actionStatus}
                                            onChange={(e) => handleFilterChange('actionStatus', e.target.value)}
                                        >
                                            <option value="">All Statuses</option>
                                            {Object.keys(AuditActionStatus).map(key => (
                                                <option key={key} value={AuditActionStatus[key]}>
                                                    {AuditActionStatus[key]}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group className="mb-3">
                                        <Form.Label style={{ fontSize: '12px', fontWeight: '600' }}>
                                            Actions
                                        </Form.Label>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <Button variant="secondary" size="sm" onClick={clearFilters}>
                                                Clear Filters
                                            </Button>
                                            <Button variant="primary" size="sm" onClick={exportLogs}>
                                                Export CSV
                                            </Button>
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Audit Logs Table */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p style={{ marginTop: '10px', color: '#666' }}>Loading audit logs...</p>
                        </div>
                    ) : auditLogs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            <p>No audit logs found</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <Table hover responsive>
                                    <thead style={{ backgroundColor: '#f8f9fa' }}>
                                        <tr>
                                            <th style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Timestamp</th>
                                            {isAdmin && <th style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>User</th>}
                                            <th style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Action</th>
                                            <th style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Resource</th>
                                            <th style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Description</th>
                                            <th style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.map((log) => (
                                            <tr key={log.id}>
                                                <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                                                    <div>{dayjs(log.created_at).format('DD-MM-YYYY')}</div>
                                                    <div style={{ fontSize: '11px', color: '#666' }}>
                                                        {dayjs(log.created_at).format('HH:mm:ss')}
                                                    </div>
                                                </td>
                                                {isAdmin && (
                                                    <td style={{ fontSize: '13px' }}>
                                                        <div>{log.user_name || 'Unknown'}</div>
                                                        <div style={{ fontSize: '11px', color: '#666' }}>{log.user_email}</div>
                                                    </td>
                                                )}
                                                <td>
                                                    <Badge bg={getActionBadgeColor(log.action_type)}>
                                                        {log.action_type}
                                                    </Badge>
                                                </td>
                                                <td style={{ fontSize: '13px' }}>
                                                    <div>{log.resource_type}</div>
                                                    {log.resource_name && (
                                                        <div style={{ fontSize: '11px', color: '#666' }}>{log.resource_name}</div>
                                                    )}
                                                </td>
                                                <td style={{ fontSize: '13px', maxWidth: '300px' }}>
                                                    {log.action_description}
                                                    {log.error_message && (
                                                        <div style={{ fontSize: '11px', color: '#dc3545', marginTop: '5px' }}>
                                                            Error: {log.error_message}
                                                        </div>
                                                    )}
                                                </td>
                                                <td>
                                                    <Badge bg={getStatusBadgeColor(log.action_status)}>
                                                        {log.action_status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>

                            <div style={{ marginTop: '20px', textAlign: 'center', color: '#666' }}>
                                <p>Showing {auditLogs.length} logs</p>
                                {auditLogs.length >= logsPerPage * currentPage && (
                                    <Button
                                        variant="outline-primary"
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                    >
                                        Load More
                                    </Button>
                                )}
                            </div>
                        </>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default AuditLogs;
