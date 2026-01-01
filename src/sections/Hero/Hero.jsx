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
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

function Hero() {
    const {theme, toggleTheme} = useTheme();
    const themeIcon = theme === 'light' ? sun : moon;
    const twitterIcon = theme === 'light' ? twitterLight : twitterDark;
    const githubIcon = theme === 'light' ? githubLight : githubDark;
    const linkedinIcon = theme === 'light' ? linkedinLight : linkedinDark;
    const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation({ threshold: 0.2 });
    const { ref: infoRef, isVisible: infoVisible } = useScrollAnimation({ threshold: 0.2 });

  return(
    <section id='hero'className={styles.container}>
        <div ref={heroRef} className={`${styles.colorModeContainer} scroll-scale ${heroVisible ? 'visible' : ''}`}>
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
        <div ref={infoRef} className={`${styles.info} scroll-fade-in ${infoVisible ? 'visible' : ''}`}>
            <h1 className={styles.nameContainer}>
              <span className={styles.nameLine}>
                {'Ibadatt'.split('').map((letter, index) => (
                  <span 
                    key={index} 
                    className={styles.nameLetter}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </span>
                ))}
              </span>
              <br />
              <span className={styles.nameLine}>
                {'Singh'.split('').map((letter, index) => (
                  <span 
                    key={index} 
                    className={styles.nameLetter}
                    style={{ animationDelay: `${(7 + index) * 0.1}s` }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </span>
                ))}
              </span>
              <br />
              <span className={styles.nameLine}>
                {'Aulakh'.split('').map((letter, index) => (
                  <span 
                    key={index} 
                    className={styles.nameLetter}
                    style={{ animationDelay: `${(12 + index) * 0.1}s` }}
                  >
                    {letter === ' ' ? '\u00A0' : letter}
                  </span>
                ))}
              </span>
            </h1>
            <h2>Backend Developer</h2>
            <span>
              <a href="https://www.instagram.com/_ibadatt_singhh_/" target="_blank">
                <img src={twitterIcon} alt="" />
              </a>
              <a href="https://github.com/Ibadatt-2k" target="_blank">
                <img src={githubIcon} alt="" />
              </a>
              <a href="https://www.linkedin.com/in/ibadatt-aulakh/" target="_blank">
                <img src={linkedinIcon} alt="" />
              </a>
            </span>
            <p className={styles.description}>
                I holde a Bachelor's Degree in Computer Information Systems with hands-on experience in Python software development, working as a Junior Software Engineer. I like to write, be it code or lyrics..
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