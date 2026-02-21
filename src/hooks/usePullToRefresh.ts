import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * usePullToRefresh — shows a visual pull indicator and invalidates
 * React Query cache when the user pulls down ≥ threshold while at scroll top.
 */
export function usePullToRefresh(threshold = 80) {
    const queryClient = useQueryClient();
    const [pulling, setPulling] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);
    const touchRef = useRef<{ startY: number } | null>(null);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        await queryClient.invalidateQueries();
        // Give a brief visual pause so the user sees the spinner
        await new Promise((r) => setTimeout(r, 600));
        setRefreshing(false);
        setPullDistance(0);
        setPulling(false);
    }, [queryClient]);

    useEffect(() => {
        const onTouchStart = (e: TouchEvent) => {
            // Only activate when scrolled to top
            if (window.scrollY <= 0 && !refreshing) {
                touchRef.current = { startY: e.touches[0].clientY };
            }
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!touchRef.current || refreshing) return;
            const dy = e.touches[0].clientY - touchRef.current.startY;
            if (dy > 0) {
                setPulling(true);
                setPullDistance(Math.min(dy, threshold * 1.5));
            }
        };

        const onTouchEnd = () => {
            if (!touchRef.current || refreshing) return;
            if (pullDistance >= threshold) {
                handleRefresh();
            } else {
                setPullDistance(0);
                setPulling(false);
            }
            touchRef.current = null;
        };

        const onTouchCancel = () => {
            touchRef.current = null;
            setPullDistance(0);
            setPulling(false);
        };

        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: true });
        document.addEventListener('touchend', onTouchEnd, { passive: true });
        document.addEventListener('touchcancel', onTouchCancel, { passive: true });

        return () => {
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('touchcancel', onTouchCancel);
        };
    }, [pullDistance, threshold, refreshing, handleRefresh]);

    return { pulling, pullDistance, refreshing, threshold };
}
