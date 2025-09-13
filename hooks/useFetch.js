"use client";

import { useState, useCallback } from 'react';

function useFetch() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const executeFetch = useCallback(async (url, options) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const result = await response.json();
      setData(result);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, error, isLoading, executeFetch };
}

export default useFetch;
