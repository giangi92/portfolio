import "./index.css";
import { useSiteI18n } from "../../site/i18n";

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
  const { t } = useSiteI18n();
  return (
    <div className="container-fluid a-center">
      <div className="row">
        <div className="col-6 p-0 timePeriod">{timePeriod}</div>
        <div className="col-6 jobDescription">
          {title && <b>{`${title}`}</b>}
          <p>{`${description}`}</p>
          {activities && (
            <p>
              <b>{t.site.activities}: </b>
              <br />
              {`${activities}`}
            </p>
          )}
          {technologiesAndTools && (
            <p>
              <b>{t.site.technologies}: </b>
              <br />
              {`${technologiesAndTools}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
