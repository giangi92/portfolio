import type { ReactNode } from "react";

export const EditorShell = ({
  title,
  description,
  loadError,
  loading,
  children,
  footer,
}: {
  title: string;
  description?: string;
  loadError?: string;
  loading?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
}) => (
  <section className="admin-editor">
    <header className="mb-4">
      <h1 className="h3 mb-1">{title}</h1>
      {description && <p className="text-body-secondary mb-0">{description}</p>}
    </header>
    {loadError ? (
      <div className="alert alert-danger">Impossibile caricare i dati: {loadError}</div>
    ) : loading ? (
      <div className="spinner-border" role="status" />
    ) : (
      <>
        {children}
        {footer}
      </>
    )}
  </section>
);
