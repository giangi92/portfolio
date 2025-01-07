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

export const AboutMeContainer = () => {
  const [pageContent, setPageContent] = useState<PageContent | undefined>(
    undefined
  );
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDocument("aboutMe.json", setLoading, setError, setPageContent);
  }, []);

  return (
    <Paragraph icon="user" text={pageContent?.aboutMe} title="ABOUT ME">
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
