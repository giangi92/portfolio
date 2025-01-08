import { useState } from "react";
import { TableRow } from "../TableRow";
import { ContentHandler } from "./ContentHandler";

type ExperienceContent = {
  educationPaths: {
    timePeriod: string;
    title: string;
    description: string;
    activities: string;
    technologiesAndTools: string;
  }[];
};

export const Experience = () => {
  const [experienceContent, setExperienceContent] = useState<
    ExperienceContent | undefined
  >(undefined);

  return (
    <ContentHandler
      contentText={""}
      sectionTitle="EXPERIENCE"
      documentName="experienceContent.json"
      icon="experience"
      setPageContent={setExperienceContent}
    >
      <>
        {experienceContent?.educationPaths?.map((path, index) => (
          <TableRow
            key={index}
            timePeriod={path.timePeriod}
            title={path.title}
            description={path.description}
            activities={path.activities}
            technologiesAndTools={path.technologiesAndTools}
          />
        ))}
      </>
    </ContentHandler>
  );
};
