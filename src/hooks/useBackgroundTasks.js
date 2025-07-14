import { useState, useEffect, useRef } from "react";
import {
  handleAPIError,
  isAPISupported,
  logAPIUsage,
} from "../utils/errorHandler";

export const useBackgroundTasks = () => {
  const [isActive, setIsActive] = useState(false);
  const [taskCount, setTaskCount] = useState(0);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [performanceData, setPerformanceData] = useState({});
  const taskIdRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Check if Background Tasks API is supported
    const supported = isAPISupported("BackgroundTasks");
    setIsSupported(supported);

    if (supported && "requestIdleCallback" in window) {
      try {
        setIsActive(true);
        startBackgroundTasks();
        logAPIUsage("BackgroundTasks", "Background tasks started");
      } catch (err) {
        const errorInfo = handleAPIError("BackgroundTasks", err);
        setError(errorInfo);
      }
    } else {
      // Fallback: use setTimeout for browsers without requestIdleCallback
      setIsActive(true);
      startFallbackTasks();
      logAPIUsage("BackgroundTasks", "Using fallback background tasks");
    }

    return () => {
      stopBackgroundTasks();
    };
  }, []);

  const startBackgroundTasks = () => {
    const performBackgroundTask = () => {
      if ("requestIdleCallback" in window) {
        taskIdRef.current = window.requestIdleCallback(
          (deadline) => {
            try {
              // Perform background data processing
              const taskData = processDataInBackground(deadline);

              setTaskCount((prev) => prev + 1);
              setPerformanceData(taskData);

              logAPIUsage("BackgroundTasks", {
                taskCount: taskCount + 1,
                timeRemaining: deadline.timeRemaining(),
                didTimeout: deadline.didTimeout,
              });

              // Schedule next task
              setTimeout(performBackgroundTask, 5000);
            } catch (err) {
              const errorInfo = handleAPIError("BackgroundTasks", err);
              setError(errorInfo);
            }
          },
          { timeout: 2000 }
        );
      }
    };

    performBackgroundTask();
  };

  const startFallbackTasks = () => {
    const performFallbackTask = () => {
      try {
        // Simulate background processing without requestIdleCallback
        const taskData = processDataInBackground({ timeRemaining: () => 50 });

        setTaskCount((prev) => prev + 1);
        setPerformanceData(taskData);

        logAPIUsage("BackgroundTasks (Fallback)", {
          taskCount: taskCount + 1,
          fallback: true,
        });
      } catch (err) {
        const errorInfo = handleAPIError("BackgroundTasks", err);
        setError(errorInfo);
      }
    };

    intervalRef.current = setInterval(performFallbackTask, 5000);
  };

  const processDataInBackground = (deadline) => {
    const startTime = performance.now();

    // Simulate data processing tasks
    const data = {
      timestamp: Date.now(),
      memoryUsage: performance.memory
        ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
            total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576), // MB
          }
        : null,
      performanceEntries: performance.getEntriesByType("navigation").length,
      connectionInfo: navigator.connection
        ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
          }
        : null,
      processingTime: 0,
    };

    // Simulate some processing work
    let iterations = 0;
    const maxIterations = 10000;

    while (
      iterations < maxIterations &&
      (deadline.timeRemaining() > 1 || iterations < 100)
    ) {
      // Simulate work
      Math.random() * Math.random();
      iterations++;
    }

    const endTime = performance.now();
    data.processingTime = endTime - startTime;
    data.iterations = iterations;

    // Store data in localStorage for persistence
    try {
      const existingData = JSON.parse(
        localStorage.getItem("backgroundTaskData") || "[]"
      );
      existingData.push(data);

      // Keep only last 50 entries
      const limitedData = existingData.slice(-50);
      localStorage.setItem("backgroundTaskData", JSON.stringify(limitedData));
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }

    return data;
  };

  const stopBackgroundTasks = () => {
    if (taskIdRef.current) {
      window.cancelIdleCallback(taskIdRef.current);
      taskIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsActive(false);
    logAPIUsage("BackgroundTasks", "Background tasks stopped");
  };

  const getStoredData = () => {
    try {
      return JSON.parse(localStorage.getItem("backgroundTaskData") || "[]");
    } catch (e) {
      return [];
    }
  };

  const clearStoredData = () => {
    try {
      localStorage.removeItem("backgroundTaskData");
      logAPIUsage("BackgroundTasks", "Stored data cleared");
    } catch (e) {
      console.warn("Could not clear localStorage:", e);
    }
  };

  return {
    isActive,
    taskCount,
    error,
    isSupported,
    performanceData,
    getStoredData,
    clearStoredData,
    stopBackgroundTasks,
    startBackgroundTasks: isSupported
      ? startBackgroundTasks
      : startFallbackTasks,
  };
};
