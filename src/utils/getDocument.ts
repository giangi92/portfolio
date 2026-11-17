import { fetchDocument, type DocumentName } from "../shared/content";

export const getDocument = (
  documentName: DocumentName,
  setLoading: (v: boolean) => void,
  setError: (v: boolean) => void,
  setContent: (v: any) => void
) => {
  setLoading(true);
  fetchDocument(documentName)
    .then(setContent)
    .catch((error) => {
      console.error(error);
      setError(true);
    })
    .finally(() => setLoading(false));
};
