import styles from "./ExperienceStyles.module.css"

export default function Experience() {
  const experiences = [
    {
      id: 1,
      title: "Jr.Full-Stack Engineer (AI INTEGRATION)",
      company: "ObjectBright, BC, Canada",
      duration: "November 2025 - Present",
      description:
        "Currently developing an AI agent using OpenAI APIs, Laravel, Blade, and TypeScript, supported by Qdrant for storing and retrieving customer data.\nThe agent could collect user information, answer questions with context, and operate across both a web interface and a phone number.\nThe entire system worked end-to-end as a fully deployed AI service.",
      icon: "🤖"
    },
    {
      id: 2,
      title: "Software Developer, Co-op",
      company: "ObjectBright, BC, Canada",
      duration: "May 2024 - August 2024",
      description:
        "As a Backend Developer CO-OP student, I worked with Laravel, PHP, and MySQL to build and maintain backend features.\nI supported API development, database operations, and system integrations.\nMy contributions focused on writing reliable backend code and improving overall application performance.",
      icon: "💼",
    },
  ]

  return (
    <section className={styles.experienceContainer}>
      <h1 align="center">Experience</h1>
      <div className={styles.experienceGrid}>
        {experiences.map((exp) => (
          <div key={exp.id} className={styles.experienceCard}>
            <div className={styles.iconWrapper}>
              <span className={styles.icon}>{exp.icon}</span>
            </div>
            <div className={styles.content}>
              <h3 className={styles.jobTitle}>{exp.title}</h3>
              <p className={styles.company}>{exp.company}</p>
              <p className={styles.duration}>{exp.duration}</p>
              <p className={styles.description}>{exp.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
