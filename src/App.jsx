import { useState, useEffect } from "react";
import DisplayHeader from "./components/DisplayHeader";
import AboutMe from "./components/AboutMe";
import Education from "./components/Education";
import Projects from "./components/Projects";
import CertsAchievements from "./components/CertsAchievements";
import GitHubContributionGraph from "./components/Github";

export default function App() {
	return (
		<>
			<DisplayHeader />
      <AboutMe />
      <Education />
	  <GitHubContributionGraph/>
      <Projects/>
      <CertsAchievements/>
		</>
	);
}
