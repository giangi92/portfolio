import React from "react";
import { Paragraph } from "./Paragraph";
import "./index.css";
import pageContent from "./pageContent.json";
import { Education } from "./Education";
import { Experience } from "./Experience";

export const Content = () => {
  return (
    <div className="content-root">
      <div id="about-me">
        <Paragraph icon="user" text={pageContent.aboutMe} title="ABOUT ME" />
      </div>
      <div id="education">
        <Paragraph icon="book" title="EDUCATION">
          <Education />
        </Paragraph>
      </div>
      <div id="experience">
        <Paragraph
          icon="experience"
          text={pageContent.experience}
          title="EXPERIENCE"
        >
          <Experience />
        </Paragraph>
      </div>
      <div id="expertise">
        <Paragraph
          icon="studies"
          text={pageContent.expertise}
          title="EXPERTISE"
        />
      </div>
      <div id="contacts">
        <Paragraph icon="contacts" text={pageContent.contacts} title="CONTACTS" />
      </div>
    </div>
  );
};
