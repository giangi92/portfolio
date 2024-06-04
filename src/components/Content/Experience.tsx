import React from "react";
import { TableRow } from "../TableRow";
import educationContent from "./experienceContent.json";

export const Experience = () => {
  return (
    <div className="">
      {educationContent.educationPaths.map((path) => (
        <TableRow
          timePeriod={path.timePeriod}
          title={path.title}
          description={path.description}
          activities={path.activities}
          technologiesAndTools={path.technologiesAndTools}
        />
      ))}
    </div>
  );
};
