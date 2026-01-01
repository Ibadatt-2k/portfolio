import styles from "./ExperienceStyles.module.css"
import { useScrollAnimation } from "../../hooks/useScrollAnimation"
import objbrIcon from "../../assets/Objbr.png"
import staplesLogo from "../../assets/staplesLogo.png"

export default function Experience() {
  const experiences = [
    {
      id: 1,
      title: "Jr.Full-Stack Engineer (AI INTEGRATION)",
      company: "ObjectBright, BC, Canada",
      duration: "November 2025 - Present",
      description:
        "Currently developing an AI agent using OpenAI APIs, Laravel, Blade, and TypeScript, supported by Qdrant for storing and retrieving customer data.\nThe agent could collect user information, answer questions with context, and operate across both a web interface and a phone number.\nThe entire system worked end-to-end as a fully deployed AI service.",
      icon: "🤖",
      iconImage: objbrIcon
    },
    {
      id: 2,
      title: "Software Developer, Co-op",
      company: "ObjectBright, BC, Canada",
      duration: "May 2024 - August 2024",
      description:
        "As a Backend Developer CO-OP student, I worked with Laravel, PHP, and MySQL to build and maintain backend features.\nI supported API development, database operations, and system integrations.\nMy contributions focused on writing reliable backend code and improving overall application performance.",
      icon: "💼",
      iconImage: objbrIcon
    },
    {
      id: 3,
      title: "Tech support representative",
      company: "Staples, BC, Canada",
      duration: "Dec 2023 to August 2025",
      description:
        "Provided comprehensive technical support to customers, including antivirus software installation and configuration, hardware formatting and setup, and data migration services. Assisted customers with troubleshooting various technical issues and ensured smooth transitions during hardware upgrades and system maintenance.",
      icon: "💼",
      iconImage: staplesLogo
    },
  ]

  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation({ threshold: 0.3 });
  const { ref: exp1Ref, isVisible: exp1Visible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: exp2Ref, isVisible: exp2Visible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: exp3Ref, isVisible: exp3Visible } = useScrollAnimation({ threshold: 0.2 });

  const expRefs = [exp1Ref, exp2Ref, exp3Ref];
  const expVisibles = [exp1Visible, exp2Visible, exp3Visible];

  return (
    <section className={styles.experienceContainer}>
      <h1 ref={titleRef} className={`scroll-slide-right ${titleVisible ? 'visible' : ''}`} align="center">Experience</h1>
      <div className={styles.timeline}>
        {experiences.map((exp, index) => (
          <div 
            key={exp.id} 
            ref={expRefs[index]}
            className={`${styles.timelineItem} scroll-slide-right ${expVisibles[index] ? 'visible' : ''}`}
            style={{ transitionDelay: `${index * 0.15}s` }}
          >
            <div className={styles.timelineNode}>
              <div className={styles.nodeDot}></div>
              {index < experiences.length - 1 && <div className={styles.timelineLine}></div>}
            </div>
            <div className={styles.experienceCard}>
              <div className={styles.cardHeader}>
                <div className={styles.iconWrapper}>
                  {exp.iconImage ? (
                    <img src={exp.iconImage} alt="Icon" className={styles.iconImage} />
                  ) : (
                    <span className={styles.icon}>{exp.icon}</span>
                  )}
                </div>
                <div className={styles.headerContent}>
                  <h3 className={styles.jobTitle}>{exp.title}</h3>
                  <p className={styles.company}>{exp.company}</p>
                  <p className={styles.duration}>{exp.duration}</p>
                </div>
              </div>
              <div className={styles.content}>
                <p className={styles.description}>{exp.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
