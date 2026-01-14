import React, { useState, useEffect } from 'react';
import { Dropdown, Spinner, Badge } from 'react-bootstrap';
import { Cpu, CheckCircle, CaretUp, Power } from '@phosphor-icons/react';
import { supabase } from '../../configs/supabaseClient';
import toast from 'react-hot-toast';

const AIStatusFooter = () => {
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchConfigs();

        const channel = supabase
            .channel('ai_status_realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'app_ai_configs'
            }, (payload) => {
                console.log('AI Config Change Detected:', payload);
                fetchConfigs();
            })
            .subscribe((status) => {
                console.log('Supabase Realtime Status:', status);
            });

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
            console.error('Error fetching footer configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPrimary = async (targetId) => {
        // Optimistic Update
        const previousConfigs = [...configs];
        setConfigs(prev => prev.map(c => ({
            ...c,
            is_primary: c.id === targetId
        })));

        try {
            setUpdating(true);
            await supabase
                .from('app_ai_configs')
                .update({ is_primary: false })
                .neq('id', '00000000-0000-0000-0000-000000000000');

            const { error } = await supabase
                .from('app_ai_configs')
                .update({ is_primary: true })
                .eq('id', targetId);

            if (error) throw error;
            toast.success('Active AI Model Updated');
        } catch (error) {
            setConfigs(previousConfigs);
            toast.error('Update failed');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeactivate = async () => {
        // Optimistic Update
        const previousConfigs = [...configs];
        setConfigs(prev => prev.map(c => ({ ...c, is_primary: false })));

        try {
            setUpdating(true);
            const { error } = await supabase
                .from('app_ai_configs')
                .update({ is_primary: false })
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (error) throw error;
            toast.success('AI Globally Deactivated');
        } catch (error) {
            setConfigs(previousConfigs);
            toast.error('Deactivation failed');
        } finally {
            setUpdating(false);
        }
    };

    const activeConfig = configs.find(c => c.is_primary);

    if (loading) return (
        <div className="d-flex align-items-center gap-2 text-muted fs-8">
            <Spinner animation="grow" size="sm" variant="primary" style={{ width: '8px', height: '8px' }} />
            <span>AI Synchronizing...</span>
        </div>
    );

    return (
        <Dropdown drop="up" align="end">
            <Dropdown.Toggle
                as="div"
                className={`ai-status-pill cursor-pointer d-flex align-items-center gap-2 py-1 px-3 rounded-pill border shadow-sm transition-all hover-shadow-md ${!activeConfig ? 'ai-off-state bg-light-5' : 'bg-white'}`}
                style={{
                    fontSize: '0.75rem',
                    borderColor: activeConfig ? 'rgba(0, 125, 136, 0.2)' : 'rgba(0, 0, 0, 0.1)',
                    background: activeConfig ? 'rgba(255, 255, 255, 0.8)' : 'rgba(240, 240, 240, 0.6)',
                    backdropFilter: 'blur(8px)',
                    height: '32px'
                }}
            >
                <div className="position-relative d-flex align-items-center">
                    <div className={`status-dot ${activeConfig ? 'online' : 'offline'}`}></div>
                    <Cpu
                        weight={activeConfig ? "fill" : "bold"}
                        size={16}
                        className={`${activeConfig ? 'text-primary ai-heartbeat' : 'text-muted'}`}
                    />
                </div>

                <div className="d-flex flex-column line-height-1">
                    <span className={`fw-bold text-truncate ${activeConfig ? 'text-dark' : 'text-muted'}`} style={{ maxWidth: '100px' }}>
                        {activeConfig?.name || activeConfig?.provider || 'AI Status: Off'}
                    </span>
                </div>

                {updating ? (
                    <Spinner animation="border" size="sm" variant="primary" style={{ width: '10px', height: '10px' }} />
                ) : (
                    <CaretUp size={12} className="text-muted ms-1" />
                )}
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-lg border-0 p-2 mb-2" style={{ minWidth: '220px', borderRadius: '12px' }}>
                <div className="px-2 py-2 mb-1 border-bottom d-flex align-items-center justify-content-between">
                    <span className="fw-bold fs-8 text-uppercase tracking-wider text-muted">System AI</span>
                    <Badge bg={activeConfig ? "soft-success" : "soft-danger"} pill className="fs-9">
                        {activeConfig ? 'Online' : 'Offline'}
                    </Badge>
                </div>
                {configs.map(config => (
                    <Dropdown.Item
                        key={config.id}
                        active={config.is_primary}
                        onClick={() => handleSelectPrimary(config.id)}
                        className="rounded-3 py-2 px-3 d-flex align-items-center justify-content-between mb-1"
                    >
                        <div className="d-flex align-items-center gap-2">
                            <Cpu size={14} weight={config.is_primary ? "fill" : "regular"} />
                            <span className="fs-8">{config.name || config.provider}</span>
                        </div>
                        {config.is_primary && <CheckCircle weight="fill" size={14} className="text-success" />}
                    </Dropdown.Item>
                ))}

                <Dropdown.Divider />

                <Dropdown.Item
                    onClick={handleDeactivate}
                    className="rounded-3 py-2 px-3 d-flex align-items-center gap-2 text-danger hover-bg-danger-soft mb-1"
                >
                    <Power weight="bold" size={14} />
                    <span className="fs-8 fw-bold">Turn AI Off</span>
                </Dropdown.Item>

                {configs.length === 0 && (
                    <div className="px-3 py-4 text-center">
                        <Power size={24} weight="duotone" className="text-muted mb-2 opacity-50" />
                        <div className="fs-9 text-muted">No active configurations found.</div>
                    </div>
                )}
            </Dropdown.Menu>

            <style>{`
                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    z-index: 1;
                }
                .status-dot.online {
                    background-color: #10b981;
                    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
                    animation: pulse-green 2s infinite;
                }
                .status-dot.offline {
                    background-color: #ef4444;
                }
                @keyframes pulse-green {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }
                .ai-heartbeat {
                    animation: heartbeat 1.5s ease-in-out infinite;
                    transform-origin: center;
                }
                @keyframes heartbeat {
                    0% { transform: scale(1); }
                    14% { transform: scale(1.15); }
                    28% { transform: scale(1); }
                    42% { transform: scale(1.15); }
                    70% { transform: scale(1); }
                }
                .ai-status-pill:hover {
                    border-color: var(--bs-primary) !important;
                    background: #fff !important;
                }
                .ai-status-pill.active {
                    background: var(--bs-primary-light-5) !important;
                    border-color: var(--bs-primary) !important;
                }
                .ai-off-state {
                    filter: grayscale(1);
                    opacity: 0.8;
                }
                .ai-off-state:hover {
                    filter: grayscale(0.5);
                    opacity: 1;
                }
                .line-height-1 { line-height: 1; }
            `}</style>
        </Dropdown>
    );
};

export default AIStatusFooter;
