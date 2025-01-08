import React, { useEffect, useState } from "react";
import { getDocument } from "../../utils/getDocument";
import { Paragraph } from "./Paragraph";
import { ParagraphPlaceholder } from "./ParagraphPlaceholder";
import { ColumnsPlaceholder } from "./ColumnsPlaceolder";
import { iconName } from "../../utils/getIconByName";

export type PageContent = {
  aboutMe: string;
  education: string;
  experience: string;
  expertise: string;
  contacts: string;
};

export const ContentHandler = ({
  sectionTitle,
  documentName,
  contentText,
  icon,
  setPageContent,
  children,
}: {
  sectionTitle: string;
  documentName: string;
  contentText: string;
  icon: iconName;
  setPageContent: (v: any) => void;
  children?: JSX.Element;
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (documentName && setPageContent)
      getDocument(documentName, setLoading, setError, setPageContent);
  }, [documentName, setPageContent]);

  return (
    <Paragraph icon={icon} text={contentText} title={sectionTitle}>
      {loading ? (
        children ? (
          <ColumnsPlaceholder />
        ) : (
          <ParagraphPlaceholder />
        )
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          There was an error while retriving data
        </div>
      ) : children ? (
        <>{children}</>
      ) : undefined}
    </Paragraph>
  );
};
