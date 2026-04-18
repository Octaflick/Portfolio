import { useState, useEffect } from "react";
import DisplayPicture from "./components/DisplayPicture";
import AboutMe from "./components/AboutMe";

export default function App() {
	return (
		<>
			<DisplayPicture />
      <AboutMe />
		</>
	);
}
