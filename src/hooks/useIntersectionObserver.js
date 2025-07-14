import { useState, useEffect, useRef, useMemo } from "react";
import {
  handleAPIError,
  isAPISupported,
  logAPIUsage,
} from "../utils/errorHandler";

export const useIntersectionObserver = (options = {}) => {
  // Track IDs of elements currently visible
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const observerRef = useRef(null);

  // Memoize options to prevent unnecessary re-renders
  const defaultOptions = useMemo(
    () => ({
      threshold: 0.1,
      rootMargin: "0px",
      ...options,
    }),
    [options]
  ); // Include the entire options object

  useEffect(() => {
    // Check if Intersection Observer API is supported
    const supported = isAPISupported("IntersectionObserver");
    setIsSupported(supported);

    if (supported && "IntersectionObserver" in window) {
      try {
        // Create observer instance
        observerRef.current = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const elementId = entry.target.id;

            if (entry.isIntersecting) {
              // Add element ID to visible set
              setVisibleElements((prev) => new Set([...prev, elementId]));
              logAPIUsage("IntersectionObserver", {
                element: elementId,
                visible: true,
              });
            } else {
              // Remove element ID from visible set
              setVisibleElements((prev) => {
                const newSet = new Set(prev);
                newSet.delete(elementId);
                return newSet;
              });
            }
          });
        }, defaultOptions);

        logAPIUsage("IntersectionObserver", "Observer initialized");
      } catch (err) {
        setError(handleAPIError("IntersectionObserver", err));
      }
    } else {
      setError(
        handleAPIError("IntersectionObserver", new Error("API not supported"))
      );
    }

    // Cleanup on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [defaultOptions]); // defaultOptions is now properly memoized

  // Start observing an element
  const observe = (element) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  };

  // Stop observing an element
  const unobserve = (element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
    }
  };

  return { visibleElements, error, isSupported, observe, unobserve };
};
