import "./index.css";
import fallbackImage from "../../img/unknown_person.jpg";
import menu from "./menu.json";
import { profileImageUrl, type Profile } from "../../shared/content";

export const Sidebar = ({ profile }: { profile?: Profile }) => {
  return (
    <div className="sidebar-root">
      <div id="image">
        <img
          src={profile?.image ? profileImageUrl(profile) : fallbackImage}
          onError={(e) => {
            if (e.currentTarget.src !== fallbackImage) e.currentTarget.src = fallbackImage;
          }}
          className="img-fluid userImage"
          alt={profile ? `${profile.name} ${profile.surname}` : "User"}
        />
      </div>
      <div id="content-container" className="contentContainer">
        <div id="full-name" className="fullNameContainer">
          <p className="h2">
            {profile?.name} <br />
            {profile?.surname}
          </p>
        </div>
        <div id="divider" className="dividerContainer">
          <hr className="border opacity-100" />
        </div>
        <div id="job-title">
          <p className="h5">{profile?.jobtitle}</p>
        </div>
        <div id="menu-list" className="menuList">
          <ul>
            {menu.map((menuElement, index) => (
              <li key={index} className="nav-item">
                <a href={`#${menuElement.pagelink}`} className="nav-link">
                  {menuElement.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
