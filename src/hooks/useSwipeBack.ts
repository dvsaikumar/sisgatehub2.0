import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useSwipeBack — detects a left-edge swipe gesture and navigates back.
 *
 * Only activates when the touch starts within `edgeThreshold` px of the left
 * edge and travels at least `minDistance` px horizontally (with limited y drift).
 */
export function useSwipeBack(edgeThreshold = 30, minDistance = 100) {
    const navigate = useNavigate();
    const touchRef = useRef<{ startX: number; startY: number } | null>(null);

    useEffect(() => {
        const onTouchStart = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (touch.clientX <= edgeThreshold) {
                touchRef.current = { startX: touch.clientX, startY: touch.clientY };
            }
        };

        const onTouchEnd = (e: TouchEvent) => {
            if (!touchRef.current) return;
            const touch = e.changedTouches[0];
            const dx = touch.clientX - touchRef.current.startX;
            const dy = Math.abs(touch.clientY - touchRef.current.startY);
            touchRef.current = null;

            // Horizontal swipe with limited vertical drift
            if (dx >= minDistance && dy < dx * 0.5) {
                navigate(-1);
            }
        };

        const onTouchCancel = () => {
            touchRef.current = null;
        };

        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchend', onTouchEnd, { passive: true });
        document.addEventListener('touchcancel', onTouchCancel, { passive: true });

        return () => {
            document.removeEventListener('touchstart', onTouchStart);
            document.removeEventListener('touchend', onTouchEnd);
            document.removeEventListener('touchcancel', onTouchCancel);
        };
    }, [navigate, edgeThreshold, minDistance]);
}
