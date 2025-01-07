export const ColumnsPlaceholder = () => {
  return (
    <div className="container-fluid a-center">
      <div className="row">
        <div className="col-6 p-0 timePeriod">
          <p className="placeholder-glow">
            <span
              className="placeholder col-12"
              style={{ width: "60%" }}
            ></span>
            <span
              className="placeholder col-12"
              style={{ width: "45%" }}
            ></span>
            <span
              className="placeholder col-12"
              style={{ width: "60%" }}
            ></span>
          </p>
        </div>
        <div className="col-6 jobDescription">
          <p className="placeholder-glow">
            <span className="placeholder col-12"></span>
            <span className="placeholder col-12"></span>
            <span className="placeholder col-12"></span>
          </p>
        </div>
      </div>
    </div>
  );
};
