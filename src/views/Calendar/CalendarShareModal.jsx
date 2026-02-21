import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { Trash, UserPlus, ShareNetwork } from '@phosphor-icons/react';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';

/**
 * CalendarShareModal — Share a calendar with other users.
 * Search by email, assign view/edit permissions, list shares.
 */
const CalendarShareModal = ({
    show,
    hide,
    calendar,
    onShareAdded,
    onShareRemoved,
}) => {
    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState('view');
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Fetch existing shares for this calendar
    useEffect(() => {
        if (show && calendar?.id) {
            fetchShares();
        }
    }, [show, calendar?.id]);

    const fetchShares = async () => {
        if (!calendar?.id) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('calendar_shares')
                .select('*, user:shared_with_user_id(email:user_profiles(email, display_name))')
                .eq('calendar_id', calendar.id);

            if (error) throw error;

            // Flatten user info
            const mapped = (data || []).map(share => ({
                ...share,
                userEmail: share.user?.email || 'Unknown',
                userName: share.user?.display_name || '',
            }));
            setShares(mapped);
        } catch (err) {
            console.error('Error fetching shares:', err);
            // Fallback: fetch without join
            try {
                const { data } = await supabase
                    .from('calendar_shares')
                    .select('*')
                    .eq('calendar_id', calendar.id);
                setShares(data || []);
            } catch {
                setShares([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        if (!email.trim() || !calendar?.id) return;

        setSubmitting(true);
        try {
            // Find user by email
            const { data: userProfile, error: userErr } = await supabase
                .from('user_profiles')
                .select('id, email, display_name')
                .eq('email', email.trim())
                .single();

            if (userErr || !userProfile) {
                toast.error('User not found with that email');
                setSubmitting(false);
                return;
            }

            // Check if already shared
            const alreadyShared = shares.find(s => s.shared_with_user_id === userProfile.id);
            if (alreadyShared) {
                toast.error('Calendar already shared with this user');
                setSubmitting(false);
                return;
            }

            const { error } = await supabase
                .from('calendar_shares')
                .insert([{
                    calendar_id: calendar.id,
                    shared_with_user_id: userProfile.id,
                    permission,
                }]);

            if (error) throw error;

            toast.success(`Calendar shared with ${userProfile.display_name || userProfile.email}`);
            setEmail('');
            fetchShares();
            onShareAdded?.();
        } catch (err) {
            console.error('Error sharing:', err);
            toast.error(err.message || 'Failed to share calendar');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveShare = async (shareId) => {
        try {
            const { error } = await supabase
                .from('calendar_shares')
                .delete()
                .eq('id', shareId);

            if (error) throw error;
            setShares(prev => prev.filter(s => s.id !== shareId));
            toast.success('Share removed');
            onShareRemoved?.();
        } catch (err) {
            console.error('Error removing share:', err);
            toast.error('Failed to remove share');
        }
    };

    return (
        <Modal show={show} onHide={hide} centered>
            <Modal.Body>
                <Button bsPrefix="btn-close" onClick={hide}>
                    <span aria-hidden="true">×</span>
                </Button>

                <div className="d-flex align-items-center gap-2 mb-3">
                    <ShareNetwork size={20} weight="bold" className="text-primary" />
                    <h6 className="text-uppercase fw-bold mb-0">
                        Share "{calendar?.name}"
                    </h6>
                </div>

                {/* Add share form */}
                <Form onSubmit={handleShare} className="mb-3">
                    <Form.Label className="small text-muted">Share with a team member</Form.Label>
                    <div className="d-flex gap-2">
                        <Form.Control
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={submitting}
                            size="sm"
                        />
                        <Form.Select
                            size="sm"
                            value={permission}
                            onChange={(e) => setPermission(e.target.value)}
                            style={{ width: 100 }}
                            disabled={submitting}
                        >
                            <option value="view">View</option>
                            <option value="edit">Edit</option>
                        </Form.Select>
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={!email.trim() || submitting}
                            className="d-flex align-items-center gap-1 flex-shrink-0"
                        >
                            {submitting ? <Spinner size="sm" /> : <UserPlus size={16} />}
                        </Button>
                    </div>
                </Form>

                <div className="separator separator-light my-3" />

                {/* Existing shares */}
                <div className="title-sm text-muted mb-2">Shared With</div>
                {loading ? (
                    <div className="text-center py-3"><Spinner size="sm" /></div>
                ) : shares.length === 0 ? (
                    <p className="text-muted small">Not shared with anyone yet.</p>
                ) : (
                    <ListGroup variant="flush">
                        {shares.map(share => (
                            <ListGroup.Item
                                key={share.id}
                                className="d-flex align-items-center justify-content-between px-0 py-2"
                            >
                                <div>
                                    <span className="fw-medium">
                                        {share.userName || share.userEmail || share.shared_with_user_id?.substring(0, 8)}
                                    </span>
                                    <Badge
                                        bg={share.permission === 'edit' ? 'primary' : 'secondary'}
                                        className="ms-2"
                                        style={{ fontSize: '0.65rem' }}
                                    >
                                        {share.permission}
                                    </Badge>
                                </div>
                                <Button
                                    variant="flush-dark"
                                    size="sm"
                                    className="btn-icon btn-rounded flush-soft-hover text-danger"
                                    onClick={() => handleRemoveShare(share.id)}
                                >
                                    <Trash size={16} />
                                </Button>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={hide}>Close</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CalendarShareModal;
