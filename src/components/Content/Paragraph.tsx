import type { ReactNode } from "react";
import "./Paragraph.css";
import { getIconByName, type iconName } from "../../utils/getIconByName";

interface IParagraph {
  title: string;
  icon: iconName;
  text?: string;
  children?: ReactNode;
}

export const Paragraph = ({ title, text, icon, children }: IParagraph) => {
  return (
    <div className="paragraph-root">
      <div id="title" className="title">
        <p className="h2">
          <i className={getIconByName(icon)} />
          {title}
        </p>
        <hr className="border border-2 opacity-100 title-rule" />
      </div>
      <div id="content" className="paragraphContent">
        <p>{text}</p>
        {children}
      </div>
    </div>
  );
};
