import { AboutMeContainer } from "./AboutMeContainer";
import { ContactsContainer } from "./ContactsContainer";
import { Education } from "./Education";
import { Experience } from "./Experience";
import { ExpertiseContainer } from "./ExpertiseContainer";
import { Paragraph } from "./Paragraph";
import "./index.css";

export const Content = () => {
  return (
    <div className="content-root">
      <div id="about-me">
        <AboutMeContainer />
      </div>
      <div id="education">
        <Paragraph icon="book" title="EDUCATION">
          <Education />
        </Paragraph>
      </div>
      <div id="experience">
        <Experience />
      </div>
      <div id="expertise">
        <ExpertiseContainer />
      </div>
      <div id="contacts">
        <ContactsContainer />
      </div>
    </div>
  );
};
