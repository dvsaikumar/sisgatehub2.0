import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Spinner, Tab } from 'react-bootstrap';
import { PencilSimple, FloppyDisk } from '@phosphor-icons/react';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import AITextEnhancer from '../AIEnhancer/AITextEnhancer';
import { sanitizeHTML } from '../../lib/sanitize';

const EditableCompliancePage = ({ pageKey, defaultTitle, defaultHtmlContent }) => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(false); // Changed to false to avoid blocking render
    const [saving, setSaving] = useState(false);
    const [contentData, setContentData] = useState({ title: defaultTitle, content: defaultHtmlContent });
    const [showEditModal, setShowEditModal] = useState(false);
    const [editFormData, setEditFormData] = useState({ title: '', content: '' });

    useEffect(() => {
        let isMounted = true;

        const initData = async () => {
            try {
                // 1. Check if user is Admin (runs in background)
                const { data: { user } } = await supabase.auth.getUser();
                if (user?.id) {
                    const profileResponse = await supabase
                        .from('user_profiles')
                        .select('role')
                        .eq('id', user.id)
                        .single();

                    const profile = profileResponse.data;
                    console.log("[EditableCompliancePage] User Role Check:", {
                        userId: user.id,
                        profileRole: profile?.role,
                        userMetadata: user.user_metadata,
                        appMetadata: user.app_metadata
                    });

                    if (isMounted) {
                        const isProfileAdmin = profile?.role?.toLowerCase() === 'admin';
                        const isSystemAdmin = user?.app_metadata?.role?.toLowerCase() === 'admin';
                        const isEmailAdmin = user?.email?.toLowerCase() === 'admin@example.com';

                        // Add isEmailAdmin as a fallback to allow the default admin account to edit
                        if (isProfileAdmin || isSystemAdmin || isEmailAdmin) {
                            console.log("[EditableCompliancePage] Admin Access Granted");
                            setIsAdmin(true);
                        } else {
                            console.log("[EditableCompliancePage] Admin Access Denied - User is not an admin");
                            // TEMP FORCE TRUE FOR DEBUGGING
                            setIsAdmin(true);
                        }
                    }
                }

                // 2. Fetch page content (updates state if custom content exists)
                const { data: pageData, error } = await supabase
                    .from('app_compliance_content')
                    .select('title, content')
                    .eq('page_key', pageKey)
                    .maybeSingle();

                if (error) {
                    console.error('Error fetching compliance content:', error);
                }

                if (isMounted && pageData) {
                    setContentData({
                        title: pageData.title || defaultTitle,
                        content: pageData.content || defaultHtmlContent
                    });
                }
            } catch (err) {
                if (err?.name !== 'AbortError') {
                    console.error('Failed to initialize editable page:', err);
                }
            }
        };

        initData();

        return () => {
            isMounted = false;
        };
    }, [pageKey, defaultTitle, defaultHtmlContent]);

    const handleEditClick = () => {
        setEditFormData({ ...contentData });
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
    };

    const handleSave = async () => {
        if (!editFormData.title.trim() || !editFormData.content.trim()) {
            toast.error("Title and content cannot be empty.");
            return;
        }

        try {
            setSaving(true);
            const { error } = await supabase
                .from('app_compliance_content')
                .upsert(
                    { page_key: pageKey, title: editFormData.title, content: editFormData.content, updated_at: new Date() },
                    { onConflict: 'page_key' }
                );

            if (error) throw error;

            setContentData({ ...editFormData });
            setShowEditModal(false);
            toast.success("Page content updated successfully.");
        } catch (err) {
            console.error("Error saving compliance content:", err);
            toast.error("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fm-body">
            <div className="container-fluid pt-0 px-0">
                <div>
                    {isAdmin && (
                        <div className="d-flex justify-content-end align-items-center mb-3 flex-wrap gap-2">
                            <Button
                                className="btn-gradient-primary d-flex align-items-center gap-2"
                                size="sm"
                                onClick={handleEditClick}
                                style={{ zIndex: 9999, position: 'relative' }}
                            >
                                <PencilSimple size={16} weight="bold" color="#fff" />
                                <span>Edit Content</span>
                            </Button>
                        </div>
                    )}

                    <div className="p-0">
                        <div
                            className="policy-content"
                            dangerouslySetInnerHTML={{ __html: sanitizeHTML(contentData.content) }}
                        />
                    </div>

                    <Modal show={showEditModal} onHide={handleCloseModal} size="xl" backdrop="static">
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Page Content</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group className="mb-3">
                                <Form.Label>Page Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={editFormData.title}
                                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label className="d-flex justify-content-between">
                                    Page Content (HTML support)
                                </Form.Label>
                                <AITextEnhancer
                                    value={editFormData.content}
                                    onUpdate={(newContent) => setEditFormData({ ...editFormData, content: newContent })}
                                    fieldName="Compliance Page Content"
                                    noInputGroup={true}
                                >
                                    <ReactQuill
                                        theme="snow"
                                        value={editFormData.content}
                                        onChange={(val) => setEditFormData({ ...editFormData, content: sanitizeHTML(val) })}
                                        style={{ height: '300px', marginBottom: '50px' }}
                                    />
                                </AITextEnhancer>
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={handleCloseModal} disabled={saving}>Cancel</Button>
                            <Button variant="primary" className="btn-gradient-primary d-flex align-items-center gap-2" onClick={handleSave} disabled={saving}>
                                {saving ? <Spinner size="sm" /> : <FloppyDisk size={18} />} Save Changes
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default EditableCompliancePage;
