import { useEffect, useState } from "react";
import { fetchDocument, type DocumentName } from "./content";

export const useDocument = <T,>(name: DocumentName) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchDocument<T>(name)
      .then((doc) => active && setData(doc))
      .catch((e) => {
        console.error(e);
        if (active) setError(true);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [name]);

  return { data, setData, loading, error };
};
