import { useState, useEffect, useRef } from "react";
import {
  handleAPIError,
  isAPISupported,
  logAPIUsage,
} from "../utils/errorHandler";

/**
 * Custom hook for managing Background Tasks API
 * Performs background processing using requestIdleCallback for optimal performance
 * @returns {Object} Hook state and data including isActive, taskCount, error, isSupported, performanceData
 */
export const useBackgroundTasks = () => {
  // State for tracking background task status
  const [isActive, setIsActive] = useState(false);
  const [taskCount, setTaskCount] = useState(0);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [performanceData, setPerformanceData] = useState({});

  // Ref to store the current task ID for cleanup
  const taskIdRef = useRef(null);

  useEffect(() => {
    // Check if Background Tasks API is supported in current browser
    const supported = isAPISupported("BackgroundTasks");
    setIsSupported(supported);

    if (supported && "requestIdleCallback" in window) {
      try {
        // Mark background tasks as active
        setIsActive(true);

        /**
         * Performs background data processing when browser is idle
         * Uses requestIdleCallback to avoid blocking main thread
         */
        const performBackgroundTask = () => {
          taskIdRef.current = window.requestIdleCallback(() => {
            // Collect performance and system data
            const data = {
              timestamp: Date.now(),
              // Memory usage in MB (if available)
              memoryUsage: performance.memory
                ? Math.round(performance.memory.usedJSHeapSize / 1048576)
                : 0,
              taskCount: taskCount + 1,
            };

            // Update task counter and performance data
            setTaskCount((prev) => prev + 1);
            setPerformanceData(data);

            // Attempt to store data in localStorage for persistence
            try {
              localStorage.setItem("backgroundData", JSON.stringify(data));
            } catch {
              // Handle localStorage errors silently (quota exceeded, private mode, etc.)
              console.warn("LocalStorage not available - data not persisted");
            }

            // Log API usage for debugging
            logAPIUsage("BackgroundTasks", data);

            // Schedule next background task in 5 seconds
            setTimeout(performBackgroundTask, 5000);
          });
        };

        // Start the background task loop
        performBackgroundTask();
      } catch (err) {
        // Handle any errors during background task setup
        setError(handleAPIError("BackgroundTasks", err));
      }
    } else {
      // Handle unsupported browsers
      setIsActive(false);
      setError(
        handleAPIError("BackgroundTasks", new Error("API not supported"))
      );
    }

    // Cleanup function to cancel any pending background tasks
    return () => {
      if (taskIdRef.current) {
        window.cancelIdleCallback(taskIdRef.current);
      }
    };
  }, [taskCount]); // Re-run effect when taskCount changes

  // Return hook state and data
  return {
    isActive,
    taskCount,
    error,
    isSupported,
    performanceData,
  };
};
