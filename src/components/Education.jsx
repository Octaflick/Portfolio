import NST_Logo from "../assets/nst.png"
import APS_Logo from "../assets/aps.png"
import SACS_Logo from "../assets/sacs.png"

export default function Education(){
    return <div className="education">
        <fieldset>
            <h3>Education</h3>
            <div className="education-sub" id="graduation">
            <div className="img"><img src={NST_Logo} alt="Newton School of Technology"/></div>
            <div className="details">
            <h4>Newton School of Technology</h4>
            <h5>B.Tech in Computer Science(AI&ML)</h5>
            <h6 className="dur">2025-2029</h6>
            <h6 className="grade">CGPA - 9.14</h6>
        </div>
        </div>
        <div className="education-sub" id="high-school">
            <div className="img"><img src={APS_Logo} alt="Abhinav Public School"/></div>
            <div className="details">
            <h4>Abhinav Public School CBSE</h4>
            <h5>Class XIIth</h5>
            <h6 className="dur">2023-2025</h6>
            <h6 className="grade">Scored 84.4</h6>
        </div>
        </div>
        <div className="education-sub" id="matriculation">
            <div className="img"><img src={SACS_Logo} alt="St.Arnold's Central School"/></div>
            <div className="details"><h4>St.Arnold's Central School CBSE</h4>
            <h5>Class Xth</h5>
            <h6 className="dur">2014-2023</h6>
            <h6 className="grade">Scored 88.8 %</h6>
        </div>
        </div>
        </fieldset>
        
    </div>
}