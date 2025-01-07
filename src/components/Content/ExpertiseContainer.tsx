import { useState, useEffect } from "react";
import { getDocument } from "../../utils/getDocument";
import { Paragraph } from "./Paragraph";
import { ParagraphPlaceholder } from "./ParagraphPlaceholder";

type PageContent = {
  aboutMe: string;
  education: string;
  experience: string;
  expertise: string;
  contacts: string;
};

export const ExpertiseContainer = () => {
  const [pageContent, setPageContent] = useState<PageContent | undefined>(
    undefined
  );
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDocument("expertise.json", setLoading, setError, setPageContent);
  }, []);

  return (
    <Paragraph icon="user" text={pageContent?.expertise} title="EXPERTISE">
      {loading ? (
        <ParagraphPlaceholder />
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          There was an error while retriving data
        </div>
      ) : undefined}
    </Paragraph>
  );
};
