import React, { useState, useEffect } from 'react';
import { Card, Form, Spinner } from 'react-bootstrap';
import { Cpu, CheckCircle } from '@phosphor-icons/react';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';

const SidebarSystemStatus = () => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConfigs();

        // Subscribe to real-time changes
        const channel = supabase
            .channel('ai-configs-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'app_ai_configs'
            }, () => {
                fetchConfigs();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchConfigs = async () => {
        try {
            const { data, error } = await supabase
                .from('app_ai_configs')
                .select('*')
                .eq('status', 'Active')
                .order('name', { ascending: true });

            if (error) throw error;
            setConfigs(data || []);
        } catch (error) {
            console.error('Error fetching sidebar configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPrimary = async (targetId) => {
        try {
            setLoading(true);
            // First unset all primaries
            await supabase
                .from('app_ai_configs')
                .update({ is_primary: false })
                .neq('id', '00000000-0000-0000-0000-000000000000');

            // Set the new primary
            const { error } = await supabase
                .from('app_ai_configs')
                .update({ is_primary: true })
                .eq('id', targetId);

            if (error) throw error;

            // Refresh local state locally for instant feedback
            const updatedConfigs = configs.map(c => ({
                ...c,
                is_primary: c.id === targetId
            }));
            setConfigs(updatedConfigs);

            toast.success('Active AI Updated');
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setLoading(false);
        }
    };

    const activeConfig = configs.find(c => c.is_primary);

    return (
        <Card className="card-flush border-0 bg-primary-light-5 mx-3 mb-4 rounded-3 shadow-none overflow-hidden">
            <Card.Body className="p-3">
                <div className="d-flex align-items-center mb-2">
                    <div className="avatar avatar-xs avatar-soft-primary avatar-rounded me-2">
                        <span className="initial-wrap"><Cpu weight="fill" /></span>
                    </div>
                    <span className="fw-bold fs-7 text-dark text-uppercase ls-1">System AI</span>
                </div>

                {loading ? (
                    <div className="d-flex align-items-center py-1">
                        <Spinner animation="border" size="sm" variant="primary" className="me-2" />
                        <span className="fs-8 text-muted">Syncing...</span>
                    </div>
                ) : (
                    <>
                        <Form.Select
                            size="sm"
                            className="fs-8 border-0 shadow-none bg-white py-1"
                            value={activeConfig?.id || ''}
                            onChange={(e) => handleSelectPrimary(e.target.value)}
                        >
                            <option value="" disabled>Select AI Model...</option>
                            {configs.map(config => (
                                <option key={config.id} value={config.id}>
                                    {config.name || config.provider}
                                </option>
                            ))}
                        </Form.Select>

                        <div className="mt-2 d-flex align-items-center justify-content-between">
                            <span className="fs-9 text-muted">Status</span>
                            {activeConfig ? (
                                <span className="badge badge-soft-success badge-sm d-flex align-items-center gap-1">
                                    <CheckCircle size={10} weight="fill" /> Online
                                </span>
                            ) : (
                                <span className="badge badge-soft-danger badge-sm text-uppercase">Inactive</span>
                            )}
                        </div>
                    </>
                )}
            </Card.Body>
        </Card>
    );
};

export default SidebarSystemStatus;
