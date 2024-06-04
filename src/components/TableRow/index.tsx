import React from "react";
import "./index.css";

interface IEducationTableRow {
  timePeriod: string;
  description: string;
  title?: string;
  activities?: string;
  technologiesAndTools?: string;
}

export const TableRow = ({
  description,
  timePeriod,
  activities,
  technologiesAndTools,
  title,
}: IEducationTableRow) => {
  return (
    <div className="container-fluid a-center">
      <div className="row">
        <div className="col-6 p-0 timePeriod">{timePeriod}</div>
        <div className="col-6 jobDescription">
          {title && <b>{`${title}`}</b>}
          <p>{`${description}`}</p>
          {activities && (
            <p>
              <b>Activities: </b>
              <br />
              {`${activities}`}
            </p>
          )}
          {technologiesAndTools && (
            <p>
              <b>Technologies And Tools: </b>
              <br />
              {`${technologiesAndTools}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
