import linkedIn_Logo from "../assets/linkedin.svg"
import github_Logo from "../assets/github.svg"
import mail_Logo from "../assets/envelope.svg"
import pfp from "../assets/pfp.jpg";

export default function DisplayPicture({img_url=pfp}){
    let linkedIn = "https://www.linkedin.com/in/vedant-tapkir-62a42320b/"
    let github = "https://github.com/Octaflick"
    let mailId = "mailto:vedanttapkir@gmail.com"
    return (
        <div className="profile-photo">
        <img id="pfp" src={img_url} alt="Profile Photo"/>
        <h2>Vedant Tapkir</h2>
        <div className="contact">
            <a href={linkedIn}><img src={linkedIn_Logo} alt="linkedin"/></a>
            <a href={github}><img src={github_Logo}/></a>
            <a href={mailId}><img src={mail_Logo}/></a>
        </div>
        </div>
    )
}
