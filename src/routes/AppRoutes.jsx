import React, { Suspense } from 'react'
import { Route, Redirect, Switch } from 'react-router-dom'
import LayoutClassic from '../layout/MainLayout/ClassicLayout'
import { routes } from './RouteList'

import { supabase } from '../configs/supabaseClient';
import { useState, useEffect } from 'react';

const AppRoutes = (props) => {
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
        return <Redirect to="/auth/login" />;
    }

    const { match } = props;

    return (
        <Suspense
            fallback={
                <div className="preloader-it">
                    <div className="loader-pendulums" />
                </div>
            }>
            <LayoutClassic>
                <Switch>

                    {
                        routes.map((obj, i) => {
                            return (obj.component) ? (
                                <Route
                                    key={i}
                                    exact={obj.exact}
                                    path={match.path + obj.path}
                                    render={matchProps => (
                                        <obj.component {...matchProps} />
                                    )}
                                />) : (null)
                        })
                    }
                    <Route path="*">
                        <Redirect to="/error-404" />
                    </Route>
                </Switch>
            </LayoutClassic>
        </Suspense>
    )
}

export default AppRoutes
