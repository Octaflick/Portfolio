import github_Logo from "../assets/github.svg";

export default function Projects() {
	return (
		<div className='projects'>
			<fieldset>
				<h3>Projects</h3>
                <div className='project-sub' id='self-help-diary'>
					<h4>Reactified Portfolio <strong>(WIP)</strong></h4>
					<p>Turned my pure HTML & CSS Portfolio to a React based webpage. Plans to make in immersive and interactive.</p>
					<div className='view-projects'>
						<a
							className='project-link-live'
							href='https://portfolio-vedanttapkir.vercel.app/'>
							View Live 
						</a>
						<a
							className='project-link-github'
							href='https://github.com/Octaflick/Portfolio'>
							View on Github
							<img src={github_Logo} />
						</a>
					</div>
				</div>
                <div className='project-sub' id='self-help-diary'>
					<h4>Truthify</h4>
					<p>Group Project on <strong>'AI Misinformation Detector'</strong>. I contributed by handling the <strong>blog section</strong> and <strong>fine-tuning</strong> the agent parameters for consistent and precise output.</p>
					<div className='view-projects'>
						<a
							className='project-link-live'
							href='https://bash-n-bloom.himanshubuilds.in/'>
							View Live 
						</a>
						<a
							className='project-link-github'
							href='https://github.com/AbnormalPilot/truthify'>
							View on Github
							<img src={github_Logo} />
						</a>
					</div>
				</div>
				<div className='project-sub' id='self-help-diary'>
					<h4>Self Help Diary</h4>
					<p>First React project to learn the fundamentals of React</p>
					<div className='view-projects'>
						<a
							className='project-link-live'
							href='https://self-help-diary.vercel.app'>
							View Live 
						</a>
						<a
							className='project-link-github'
							href='https://github.com/Octaflick/self-help-diary'>
							View on Github
							<img src={github_Logo} />
						</a>
					</div>
				</div>
				<div className='project-sub' id='bite-knights'>
					<h4>Bite Knights</h4>
					<p>
						A fully fledged commerce website to order items,suggest menu,etc.
					</p>
					<div className='view-projects'>
                        <a
							className='project-link-github'
							href='https://github.com/Octaflick/bite-knights'>
							View on Github
							<img src={github_Logo} />
						</a>
					</div>
				</div>
				<div className='project-sub' id='slms'>
					<h4>School Library Management System</h4>
					<p>
						Python based GUI Application. Stores data in excel sheets. Offers a
						simple way to store records of book issues,student history,book
						history,etc.
					</p>
					<div className='view-projects'>

                         <a
							className='project-link-github'
							href='https://github.com/Octaflick/SLMS'>
							View on Github
							<img src={github_Logo} />
						</a>
					</div>
				</div>
			</fieldset>
		</div>
	);
}
