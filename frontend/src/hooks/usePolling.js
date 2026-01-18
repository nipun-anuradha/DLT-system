import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for smart polling with visibility detection
 * - Polls at specified interval when tab is visible
 * - Pauses polling when tab is hidden (saves resources/battery)
 * - Immediately fetches when tab becomes visible again
 * 
 * @param {Function} fetchFn - The function to call for fetching data
 * @param {number} interval - Polling interval in milliseconds (default: 15000ms)
 * @param {boolean} enabled - Whether polling is enabled (default: true)
 */
const usePolling = (fetchFn, interval = 15000, enabled = true) => {
  const intervalRef = useRef(null);
  const fetchFnRef = useRef(fetchFn);

  // Keep fetchFn ref updated
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // Already polling
    
    intervalRef.current = setInterval(() => {
      fetchFnRef.current();
    }, interval);
  }, [interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopPolling();
      return;
    }

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Immediately fetch when tab becomes visible
        fetchFnRef.current();
        startPolling();
      }
    };

    // Start polling if tab is visible
    if (!document.hidden) {
      startPolling();
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, startPolling, stopPolling]);

  return { startPolling, stopPolling };
};

export default usePolling;
