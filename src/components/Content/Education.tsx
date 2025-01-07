import React, { useEffect, useState } from "react";
import { TableRow } from "../TableRow";
import { ColumnsPlaceholder } from "./ColumnsPlaceolder";
import { getDocument } from "../../utils/getDocument";

type EducationContent = {
  educationPaths: { timePeriod: string; description: string }[];
};

export const Education = () => {
  const [educationContent, setEducationContent] = useState<
    EducationContent | undefined
  >(undefined);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const getEducationInfo = () => {
    getDocument(
      "educationContent.json",
      setLoading,
      setError,
      setEducationContent
    );
  };

  useEffect(() => {
    getEducationInfo();
  }, []);

  return (
    <div className="">
      {error ? (
        <div className="alert alert-danger" role="alert">
          There was an error while retriving data
        </div>
      ) : educationContent && !loading ? (
        educationContent?.educationPaths.map((path, index) => (
          <TableRow
            key={index}
            timePeriod={path.timePeriod}
            description={path.description}
          />
        ))
      ) : (
        <ColumnsPlaceholder />
      )}
    </div>
  );
};
