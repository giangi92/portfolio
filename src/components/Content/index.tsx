import { AboutMe } from "./AboutMe";
import { Contacts } from "./Contacts";
import { Education } from "./Education";
import { Experience } from "./Experience";
import { Expertise } from "./Expertise";
import "./index.css";

export const Content = () => {
  return (
    <div className="content-root">
      <div id="aboutMe">
        <AboutMe />
      </div>
      <div id="education">
        <Education />
      </div>
      <div id="experience">
        <Experience />
      </div>
      <div id="expertise">
        <Expertise />
      </div>
      <div id="contacts">
        <Contacts />
      </div>
    </div>
  );
};
