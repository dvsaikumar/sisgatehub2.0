import { AnimatePresence } from 'framer-motion'
import classNames from 'classnames'
import { Suspense } from 'react'
import { Route, Routes, Navigate, useMatch, useNavigate, useLocation, useParams } from 'react-router-dom'
import { authRoutes } from './RouteList'
import PageAnimate from '../components/Animation/PageAnimate'

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

const ClassicRoutes = () => {
    const lockScreenAuth = useMatch("/auth/lock-screen");

    return (
        <AnimatePresence>
            <Suspense
                fallback={
                    <div className="preloader-it">
                        <div className="loader-pendulums" />
                    </div>
                }>
                <div className={classNames("hk-wrapper hk-pg-auth", { "bg-primary-dark-3": lockScreenAuth })} data-footer="simple" >
                    <Routes>
                        {
                            authRoutes.map((obj, i) => {
                                return (obj.component) ? (
                                    <Route
                                        key={i}
                                        path={obj.path}
                                        element={
                                            <PageAnimate>
                                                <LegacyRouteWrapper component={obj.component} />
                                            </PageAnimate>
                                        }
                                    />) : (null)
                            })
                        }
                        <Route path="*" element={<Navigate to="/error-404" replace />} />
                    </Routes>
                </div>
            </Suspense>
        </AnimatePresence>
    )
}

export default ClassicRoutes
