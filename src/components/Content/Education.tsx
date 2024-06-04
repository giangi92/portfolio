import React from "react";
import { TableRow } from "../TableRow";
import educationContent from "./educationContent.json";

export const Education = () => {
  return (
    <div className="">
        {educationContent.educationPaths.map((path) => (
          <TableRow
            timePeriod={path.timePeriod}
            description={path.description}
          />
        ))}
    </div>
  );
};
