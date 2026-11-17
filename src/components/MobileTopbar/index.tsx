import type { Profile } from "../../shared/content";

export const MobileTopbar = ({ profile }: { profile?: Profile }) => {
  if (!profile) return null;
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
      <span style={{ fontSize: "1.4rem" }}>
        {profile.name} {profile.surname} |{" "}
      </span>
      <span style={{ fontSize: "0.8rem" }}>{profile.jobtitle} </span>
    </div>
  );
};
