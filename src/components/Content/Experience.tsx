import React, { useEffect, useState } from "react";
import { TableRow } from "../TableRow";
import { ColumnsPlaceholder } from "./ColumnsPlaceolder";
import { getDocument } from "../../utils/getDocument";

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
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDocument("experienceContent.json", setLoading, setError, setExperienceContent);
  }, []);

  return (
    <div className="">
      {error ? (
        <div className="alert alert-danger" role="alert">
          There was an error while retriving data
        </div>
      ) : experienceContent && !loading ? (
        experienceContent?.educationPaths?.map((path, index) => (
          <TableRow
            key={index}
            timePeriod={path.timePeriod}
            title={path.title}
            description={path.description}
            activities={path.activities}
            technologiesAndTools={path.technologiesAndTools}
          />
        ))
      ) : (
        <ColumnsPlaceholder />
      )}
    </div>
  );
};
