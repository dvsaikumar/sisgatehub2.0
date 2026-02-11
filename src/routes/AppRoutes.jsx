import React, { Suspense, useState, useEffect } from 'react'
import { Route, Routes, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom'
import LayoutClassic from '../layout/MainLayout/ClassicLayout'
import { routes } from './RouteList'
import { supabase } from '../configs/supabaseClient';
import ChatBotInterface from '../views/ChatPopup/ChatBot/ChatBotInterface';
import SessionManager from '../components/Auth/SessionManager';

// Shim to provide v5 props (history, location, match) to components
const LegacyRouteWrapper = ({ component: Component }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();

    const match = { params, path: location.pathname, url: location.pathname, isExact: true };
    const history = {
        push: (to) => navigate(to),
        replace: (to) => navigate(to, { replace: true }),
        goBack: () => navigate(-1)
    };

    return <Component history={history} location={location} match={match} />;
};

const AppRoutes = () => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="preloader-it">
                <div className="loader-pendulums" />
            </div>
        );
    }

    if (!session) {
        return <Navigate to="/auth/login" replace />;
    }

    return (
        <SessionManager>
            <LayoutClassic>
                <Suspense
                    fallback={
                        <div className="preloader-it">
                            <div className="loader-pendulums" />
                        </div>
                    }>
                    <Routes>
                        {
                            routes.map((obj, i) => {
                                return (obj.component) ? (
                                    <Route
                                        key={i}
                                        path={obj.path}
                                        element={<LegacyRouteWrapper component={obj.component} />}
                                    />) : (null)
                            })
                        }
                        <Route path="*" element={<Navigate to="/error-404" replace />} />
                    </Routes>
                </Suspense>
                <ChatBotInterface show={false} />
            </LayoutClassic>
        </SessionManager>
    )
}

export default AppRoutes
