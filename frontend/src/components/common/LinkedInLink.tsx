import { FaLinkedin } from "react-icons/fa";

interface LinkedinLinkProps{
    size?: number;
    className?: string;
}

export default function LinkedinLink({ size=24, className}: LinkedinLinkProps){
return (
    <a
        href="https://www.linkedin.com/in/edwinmunoz9/"
        target="_blank"
        rel="noopner noreferrer"
        arial-label="LinkedIn"
        className={`hover:opcaity-75 transition ${className}`}
    >
        <FaLinkedin size={size}/>
    </a>


);



}