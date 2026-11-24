import type { ReactNode } from "react";
import { format, useI18n } from "../i18n";

export const EditorShell = ({
  title,
  description,
  loadError,
  loading,
  children,
  footer,
  toolbar,
}: {
  /** Shown under the title, also while loading (e.g. the content language picker). */
  toolbar?: ReactNode;
  title: string;
  description?: string;
  loadError?: string;
  loading?: boolean;
  children?: ReactNode;
  footer?: ReactNode;
}) => {
  const { t } = useI18n();
  return (
  <section className="admin-editor">
    <header className="mb-4">
      <h1 className="h3 mb-1">{title}</h1>
      {description && <p className="text-body-secondary mb-0">{description}</p>}
    </header>
    {toolbar}
    {loadError ? (
      <div className="alert alert-danger">{format(t.common.loadFailed, { error: loadError })}</div>
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
};
