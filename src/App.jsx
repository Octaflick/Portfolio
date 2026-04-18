import { useState, useEffect } from "react";
import DisplayPicture from "./components/DisplayPicture";
import AboutMe from "./components/AboutMe";
import Education from "./components/Education";

export default function App() {
	return (
		<>
			<DisplayPicture />
      <AboutMe />
      <Education />
		</>
	);
}
