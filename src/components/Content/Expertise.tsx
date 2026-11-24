import { useState } from "react";
import { type PageContent, ContentHandler } from "./ContentHandler";

export const Expertise = () => {
  const [pageContent, setPageContent] = useState<PageContent | undefined>(
    undefined
  );

  return (
    <ContentHandler
      contentText={pageContent?.expertise ?? ""}
      section="expertise"
      documentName="expertise.json"
      icon="studies"
      setPageContent={setPageContent}
    />
  );
};
