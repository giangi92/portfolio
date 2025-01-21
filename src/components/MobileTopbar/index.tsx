const name = "Lorem Ipsum";
const role = "Frontend developer";
export const MobileTopbar = () => {
  return (
    <div
      style={{
        position: "fixed",
        top: 4,
        left: 55,
        whiteSpace: "nowrap",
        maxWidth: "100%",
      }}
    >
      <span style={{ fontSize: "1.4rem" }}>{name} | </span>
      <span style={{ fontSize: "0.8rem" }}>{role} </span>
    </div>
  );
};
