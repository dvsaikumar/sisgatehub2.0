import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { AuditService } from '../../services/AuditService';

export const RouteTracker = () => {
    const location = useLocation();
    const prevPath = useRef(location.pathname);

    useEffect(() => {
        // Debounce or check for meaningful changes if needed
        // For now, log every unique path visited
        const currentPath = location.pathname;

        // Log immediately on mount and updates
        // We might want to skip initial double logs if strict mode is on, but it's fine.

        // Only log if path changed to avoid duplicate on query param change? 
        // User asked for "every page", so tracking pathname is safer.
        // If we want exact tracking including params: location.search

        AuditService.logAction('VIEW_PAGE', currentPath, { search: location.search });

        prevPath.current = currentPath;

    }, [location.pathname, location.search]);

    return null; // Headless component
};
