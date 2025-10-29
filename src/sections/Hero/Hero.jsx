import styles from './HeroStyles.module.css';
import heroImg from '../../assets/DPP.jpg';
import sun from '../../assets/sun.svg';
import moon from '../../assets/moon.svg';
import twitterLight from '../../assets/instagram-light.svg';
import githubLight from '../../assets/github-light.svg';
import linkedinLight from '../../assets/linkedin-light.svg'
import twitterDark from '../../assets/instagram-dark.svg';
import githubDark from '../../assets/github-dark.svg';
import linkedinDark from '../../assets/linkedin-dark.svg'
import CV from '../../assets/Ibadatt-Resume.pdf';
import { useTheme } from '../../common/ThemeContext';
function Hero() {
    const {theme, toggleTheme} = useTheme();
    const themeIcon = theme === 'light' ? sun : moon;
    const twitterIcon = theme === 'light' ? twitterLight : twitterDark;
    const githubIcon = theme === 'light' ? githubLight : githubDark;
    const linkedinIcon = theme === 'light' ? linkedinLight : linkedinDark;

  return(
    <section id='hero'className={styles.container}>
        <div className={styles.colorModeContainer}>
            <img
                className={styles.hero}
                src={heroImg}
                alt="Nope..."
            />
            <img
            className={styles.colorMode}
            src={themeIcon}
            alt="used for color mode.."
            onClick={toggleTheme}
            />
        </div>
        <div className={styles.info}>
            <h1>
              Ibadatt
              <br />Singh
              <br />Aulakh
            </h1>
            <h2>Backend Developer</h2>
            <span>
              <a href="https://www.instagram.com/_ibadatt_singhh_/" target="_blank">
                <img src={twitterIcon} alt="" />
              </a>
              <a href="https://github.com/Ibadatt19" target="_blank">
                <img src={githubIcon} alt="" />
              </a>
              <a href="https://www.linkedin.com/in/ibadatt-aulakh/" target="_blank">
                <img src={linkedinIcon} alt="" />
              </a>
            </span>
            <p className={styles.description}>
                A CIS graduate with a passion for backnd development and has a knowledge of AWS, MLA and Fullstack
            </p>
            <a href={CV} download className='post'>
                   <button className='hover'>
                    Resume
                   </button>
            </a>
        </div>
    </section>
);
}

export default Hero;