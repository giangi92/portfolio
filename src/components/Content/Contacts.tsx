import { useState } from "react";
import { ContentHandler, PageContent } from "./ContentHandler";

export const Contacts = () => {
  const [pageContent, setPageContent] = useState<PageContent | undefined>(
    undefined
  );

  return (
    <ContentHandler
      contentText={pageContent?.contacts ?? ""}
      sectionTitle="CONTACTS"
      documentName="contacts.json"
      icon="contacts"
      setPageContent={setPageContent}
    />
  );
};
