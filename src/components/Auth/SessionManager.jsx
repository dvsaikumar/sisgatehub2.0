import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { supabase } from '../../configs/supabaseClient';
import { useNavigate } from 'react-router-dom';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE = 5 * 60 * 1000; // 5 minutes before timeout
const ABSOLUTE_TIMEOUT_HOURS = 8;

const SessionManager = ({ children }) => {
    const navigate = useNavigate();
    const [showWarning, setShowWarning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const lastActionTime = useRef(Date.now());
    const absoluteExpiryTime = useRef(Date.now() + ABSOLUTE_TIMEOUT_HOURS * 60 * 60 * 1000);
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    // Update last action time on user activity
    const updateLastAction = useCallback(() => {
        if (!showWarning) {
            lastActionTime.current = Date.now();
        }
    }, [showWarning]);

    useEffect(() => {
        // Add event listeners
        activityEvents.forEach(event => {
            window.addEventListener(event, updateLastAction);
        });

        // Interval to check for timeout
        const intervalId = setInterval(() => {
            const now = Date.now();
            const timeSinceLastAction = now - lastActionTime.current;

            // Absolute Timeout Check
            if (now > absoluteExpiryTime.current) {
                handleLogout('Your session has reached the maximum duration.');
                return;
            }

            // Idle Timeout Check
            if (timeSinceLastAction > IDLE_TIMEOUT) {
                handleLogout('You have been logged out due to inactivity.');
            } else if (timeSinceLastAction > (IDLE_TIMEOUT - WARNING_BEFORE)) {
                if (!showWarning) {
                    setShowWarning(true);
                }
                const remaining = Math.ceil((IDLE_TIMEOUT - timeSinceLastAction) / 1000);
                setTimeLeft(remaining);
            } else {
                if (showWarning) {
                    setShowWarning(false);
                }
            }
        }, 1000);

        return () => {
            activityEvents.forEach(event => {
                window.removeEventListener(event, updateLastAction);
            });
            clearInterval(intervalId);
        };
    }, [showWarning, updateLastAction]);

    const sessionIdRef = useRef(null);

    // Initial Session Registration
    useEffect(() => {
        const registerSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            // Simple fingerprinting
            const browserInfo = navigator.userAgent;
            const tokenHash = session.access_token.slice(-20); // Last 20 chars as proxy ID

            // Insert session
            const { data, error } = await supabase
                .from('active_sessions')
                .insert([
                    {
                        user_id: session.user.id,
                        access_token_hash: tokenHash,
                        user_agent: browserInfo,
                        location: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    }
                ])
                .select()
                .single();

            if (data) {
                sessionIdRef.current = data.id;
            } else if (error) {
                console.error("Failed to register session:", error);
            }
        };

        registerSession();

        // Heartbeat to update last_active and check for revocation
        const heartbeatInterval = setInterval(async () => {
            if (sessionIdRef.current) {
                const { error, count } = await supabase
                    .from('active_sessions')
                    .update({ last_active: new Date().toISOString() })
                    .eq('id', sessionIdRef.current)
                    .select('id', { count: 'exact' });

                // If row deleted (count === 0) or error, session is revoked
                if (!error && count === 0) {
                    handleLogout('Your session has been revoked.');
                }
            }
        }, 60 * 1000); // Every minute

        return () => {
            clearInterval(heartbeatInterval);
            // Optional: cleanup on unmount if we wanted strict "tab closed" tracking, 
            // but for now we let it persist until logout or timeout
        };
    }, []);

    const handleLogout = async (reason) => {
        try {
            // Remove session from DB
            if (sessionIdRef.current) {
                await supabase
                    .from('active_sessions')
                    .delete()
                    .eq('id', sessionIdRef.current);
            }

            await supabase.auth.signOut();
            window.localStorage.removeItem('sb-sisgate-auth-token');
            navigate('/auth/login', { state: { message: reason } });
        } catch (error) {
            console.error('Logout failed:', error);
            window.location.href = '/auth/login';
        }
    };

    const handleExtendSession = async () => {
        lastActionTime.current = Date.now();
        setShowWarning(false);
        // Force heartbeat update
        if (sessionIdRef.current) {
            await supabase
                .from('active_sessions')
                .update({ last_active: new Date().toISOString() })
                .eq('id', sessionIdRef.current);
        }
    };

    return (
        <>
            {children}
            <Modal show={showWarning} onHide={handleLogout} backdrop="static" keyboard={false} centered>
                <Modal.Header>
                    <Modal.Title className="text-danger">Session Expiring</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Your session will expire in {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')} due to inactivity.</p>
                    <p>Do you want to stay logged in?</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => handleLogout('Logged out by user')}>
                        Sign Out
                    </Button>
                    <Button variant="primary" onClick={handleExtendSession}>
                        Keep me Signed In
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SessionManager;
