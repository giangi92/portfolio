import React from "react";
import "./Paragraph.css";
import { getIconByName, iconName } from "../../utils/getIconByName";

interface IParagraph {
  title: string;
  icon: iconName;
  text?: string;
  children?: JSX.Element
}

export const Paragraph = ({ title, text, icon, children }: IParagraph) => {
  return (
    <div className="paragraph-root">
      <div id="title" className="title">
        <p className="h2">
          <i className={getIconByName(icon)} />
          {title}
        </p>
        <hr className="border border-black border-2 opacity-100" />
      </div>
      <div id="content" className="paragraphContent">
        <p>{text}</p>
        {children}
      </div>
    </div>
  );
};
