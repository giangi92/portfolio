import { useState } from "react";
import { TableRow } from "../TableRow";
import { ContentHandler } from "./ContentHandler";

type EducationContent = {
  educationPaths: { timePeriod: string; description: string }[];
};

export const Education = () => {
  const [educationContent, setEducationContent] = useState<
    EducationContent | undefined
  >(undefined);

  return (
    <ContentHandler
      contentText={""}
      sectionTitle="EDUCATION"
      documentName="educationContent.json"
      setPageContent={setEducationContent}
      icon="book"
    >
      <>
        {educationContent?.educationPaths.map((path, index) => (
          <TableRow
            key={index}
            timePeriod={path.timePeriod}
            description={path.description}
          />
        ))}
      </>
    </ContentHandler>
  );
};
