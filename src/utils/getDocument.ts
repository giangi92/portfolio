export const getDocument = (
  documentName: string,
  setLoading: (v: boolean) => void,
  setError: (v: boolean) => void,
  setContent: (v: any) => void
) => {
  setLoading(true);
  const reqHeaders = new Headers();
  reqHeaders.set("Content-Type", "application/json");
  reqHeaders.set("Accept", "application/json");

  fetch(`files/${documentName}`, {
    headers: reqHeaders,
  })
    .then((res) => res.json())
    .then((res) => setContent(res))
    .catch((error) => {
      console.log(error);
      setError(true);
    })
    .finally(() => setLoading(false));
};
