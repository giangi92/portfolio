import { useState } from "react";
import { ContentHandler, type PageContent } from "./ContentHandler";

export const Contacts = () => {
  const [pageContent, setPageContent] = useState<PageContent | undefined>(
    undefined
  );

  return (
    <ContentHandler
      contentText={pageContent?.contacts ?? ""}
      section="contacts"
      documentName="contacts.json"
      icon="contacts"
      setPageContent={setPageContent}
    />
  );
};
