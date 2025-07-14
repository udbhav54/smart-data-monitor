import { useState, useEffect, useRef } from "react";
import {
  handleAPIError,
  isAPISupported,
  logAPIUsage,
} from "../utils/errorHandler";

export const useIntersectionObserver = (options = {}) => {
  const [visibleElements, setVisibleElements] = useState(new Set());
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const observerRef = useRef(null);
  const elementsRef = useRef(new Map());

  const defaultOptions = {
    threshold: 0.1,
    rootMargin: "0px",
    ...options,
  };

  useEffect(() => {
    // Check if Intersection Observer API is supported
    const supported = isAPISupported("IntersectionObserver");
    setIsSupported(supported);

    if (supported && "IntersectionObserver" in window) {
      try {
        observerRef.current = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const elementId = entry.target.id || entry.target.dataset.observeId;

            if (entry.isIntersecting) {
              setVisibleElements((prev) => {
                const newSet = new Set(prev);
                newSet.add(elementId);
                return newSet;
              });

              logAPIUsage("IntersectionObserver", {
                element: elementId,
                visible: true,
                intersectionRatio: entry.intersectionRatio,
              });
            } else {
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
        const errorInfo = handleAPIError("IntersectionObserver", err);
        setError(errorInfo);
      }
    } else {
      const errorInfo = handleAPIError(
        "IntersectionObserver",
        new Error("API not supported")
      );
      setError(errorInfo);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  const observe = (element) => {
    if (observerRef.current && element) {
      const elementId =
        element.id || element.dataset.observeId || `element-${Date.now()}`;
      element.dataset.observeId = elementId;

      observerRef.current.observe(element);
      elementsRef.current.set(elementId, element);

      logAPIUsage("IntersectionObserver", `Observing element: ${elementId}`);
    }
  };

  const unobserve = (element) => {
    if (observerRef.current && element) {
      observerRef.current.unobserve(element);
      const elementId = element.id || element.dataset.observeId;
      elementsRef.current.delete(elementId);

      setVisibleElements((prev) => {
        const newSet = new Set(prev);
        newSet.delete(elementId);
        return newSet;
      });

      logAPIUsage(
        "IntersectionObserver",
        `Stopped observing element: ${elementId}`
      );
    }
  };

  const isVisible = (elementId) => {
    return visibleElements.has(elementId);
  };

  const getVisibilityStats = () => {
    return {
      totalObserved: elementsRef.current.size,
      currentlyVisible: visibleElements.size,
      visibleElements: Array.from(visibleElements),
    };
  };

  return {
    observe,
    unobserve,
    isVisible,
    visibleElements,
    error,
    isSupported,
    getVisibilityStats,
  };
};

// Hook for observing a single element
export const useElementVisibility = (elementRef, options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const supported = isAPISupported("IntersectionObserver");
    if (!supported) {
      setError(
        handleAPIError("IntersectionObserver", new Error("API not supported"))
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setIsVisible(entry.isIntersecting);

        logAPIUsage("IntersectionObserver (Single Element)", {
          visible: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
        });
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return { isVisible, error };
};
