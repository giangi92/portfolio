import { useState } from "react";
import { ContentHandler, PageContent } from "./ContentHandler";

export const AboutMe = () => {
  const [pageContent, setPageContent] = useState<PageContent | undefined>(
    undefined
  );

  return (
    <ContentHandler
      contentText={pageContent?.aboutMe ?? ""}
      sectionTitle="ABOUT ME"
      documentName="aboutMe.json"
      icon="user"
      setPageContent={setPageContent}
    />
  );
};
