import { useEffect, useState, type ReactNode } from "react";
import { getDocument } from "../../utils/getDocument";
import type { DocumentName } from "../../shared/content";
import { useSiteI18n } from "../../site/i18n";
import { Paragraph } from "./Paragraph";
import { ParagraphPlaceholder } from "./ParagraphPlaceholder";
import { ColumnsPlaceholder } from "./ColumnsPlaceolder";
import type { iconName } from "../../utils/getIconByName";

export type PageContent = {
  aboutMe: string;
  education: string;
  experience: string;
  expertise: string;
  contacts: string;
};

/** Site sections; also the keys of their titles in the `site` translations. */
export type SiteSection = keyof PageContent;

export const ContentHandler = ({
  section,
  documentName,
  contentText,
  icon,
  setPageContent,
  children,
}: {
  section: SiteSection;
  documentName: DocumentName;
  contentText: string;
  icon: iconName;
  setPageContent: (v: any) => void;
  children?: ReactNode;
}) => {
  const { lang, t } = useSiteI18n();
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (documentName && setPageContent)
      getDocument(documentName, lang, setLoading, setError, setPageContent);
  }, [documentName, lang, setPageContent]);

  return (
    <Paragraph icon={icon} text={contentText} title={t.site[section].toLocaleUpperCase(lang)}>
      {loading ? (
        children ? (
          <ColumnsPlaceholder />
        ) : (
          <ParagraphPlaceholder />
        )
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {t.site.loadError}
        </div>
      ) : children ? (
        <>{children}</>
      ) : undefined}
    </Paragraph>
  );
};
