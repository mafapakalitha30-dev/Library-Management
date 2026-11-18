import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

// Loads a list from the API and exposes loading/error state plus a reload function.
export function useFetch(path) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await api.get(path));
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, reload: load };
}
