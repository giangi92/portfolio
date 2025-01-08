import React from "react";
import "./index.css";
import userImage from "../../img/unknown_person.jpg";
import sidebarData from "./SidebarContent.json";

export const Sidebar = () => {
  return (
    <div className="sidebar-root">
      <div id="image">
        <img
          src={userImage}
          className="img-fluid rounded userImage"
          alt="UserImage"
        />
      </div>
      <div id="content-container" className="contentContainer">
        <div id="full-name" className="fullNameContainer">
          <p className="h2">
            {sidebarData.name} <br />
            {sidebarData.surname}
          </p>
        </div>
        <div id="divider" className="dividerContainer">
          <hr className="border opacity-100" />
        </div>
        <div id="job-title">
          <p className="h5">{sidebarData.jobtitle}</p>
        </div>
        <div id="menu-list" className="menuList">
          <ul>
            {sidebarData.menubuttons.map((menuElement, index) => (
              <li key={index} className="nav-item">
                <a
                  href={`#${menuElement.pagelink}`}
                  className="nav-link link-info link-opacity-50-hover"
                >
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
