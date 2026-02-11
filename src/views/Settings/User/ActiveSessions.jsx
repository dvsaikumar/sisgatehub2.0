import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { supabase } from '../../../configs/supabaseClient';
import { Monitor, Phone, Trash } from '@phosphor-icons/react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const ActiveSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSessionTokenHash, setCurrentTokenHash] = useState('');

    const fetchSessions = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            setCurrentTokenHash(session.access_token.slice(-20));
        }

        const { data, error } = await supabase
            .from('active_sessions')
            .select('*')
            .order('last_active', { ascending: false });

        if (error) {
            console.error('Error fetching sessions:', error);
        } else {
            setSessions(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const revokeSession = async (id) => {
        if (!window.confirm('Are you sure you want to revoke this session? The user will be logged out properly on the next heartbeat.')) return;

        const { error } = await supabase
            .from('active_sessions')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Failed to revoke session');
        } else {
            fetchSessions();
        }
    };

    const revokeAll = async () => {
        if (!window.confirm('Sign out all other devices?')) return;

        const { error } = await supabase
            .from('active_sessions')
            .delete()
            .neq('access_token_hash', currentSessionTokenHash);

        if (error) {
            alert('Failed to revoke sessions');
        } else {
            fetchSessions();
        }
    }

    const getDeviceIcon = (ua) => {
        if (/mobile/i.test(ua)) return <Phone size={20} />;
        return <Monitor size={20} />;
    };

    return (
        <Card className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h5 className="mb-1">Active Sessions</h5>
                    <p className="text-muted small">Manage devices where you are currently logged in.</p>
                </div>
                <Button variant="outline-danger" size="sm" onClick={revokeAll}>
                    Sign Out All Other Devices
                </Button>
            </div>

            {loading ? (
                <p>Loading sessions...</p>
            ) : (
                <div className="table-responsive">
                    <Table hover className="align-middle">
                        <thead>
                            <tr>
                                <th>Device</th>
                                <th>Location</th>
                                <th>Last Active</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session) => {
                                const isCurrent = session.access_token_hash === currentSessionTokenHash;
                                return (
                                    <tr key={session.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="me-3 text-muted">
                                                    {getDeviceIcon(session.user_agent)}
                                                </div>
                                                <div style={{ maxWidth: '300px' }}>
                                                    <div className="text-truncate text-dark fw-medium" title={session.user_agent}>
                                                        {session.user_agent}
                                                    </div>
                                                    <small className="text-muted">{session.ip_address || 'IP n/a'}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{session.location || 'Unknown'}</td>
                                        <td>{dayjs(session.last_active).fromNow()}</td>
                                        <td>
                                            {isCurrent ? (
                                                <Badge bg="success" className="badge-soft-success">Current Session</Badge>
                                            ) : (
                                                <Badge bg="secondary" className="badge-soft-secondary">Active</Badge>
                                            )}
                                        </td>
                                        <td>
                                            {!isCurrent && (
                                                <Button
                                                    variant="flush"
                                                    className="btn-icon btn-rounded flush-soft-hover"
                                                    onClick={() => revokeSession(session.id)}
                                                    title="Revoke Session"
                                                >
                                                    <span className="icon">
                                                        <Trash size={18} className="text-danger" />
                                                    </span>
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {sessions.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-4 text-muted">No active sessions found.</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </div>
            )}
        </Card>
    );
};

export default ActiveSessions;
