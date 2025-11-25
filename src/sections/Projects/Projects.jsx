"use client"

import styles from "./ProjectsStyles.module.css"
import { useState } from "react"

const projects = [
  {
    id: 1,
    title: "Diabetes Prediction Model",
    description:
      "Machine learning model that predicts diabetes risk using patient health metrics. Built with Python and scikit-learn, featuring data preprocessing, feature engineering, and model optimization for 92% accuracy.",
    liveLink: "https://diabetes-streamlit-frontend.onrender.com/",
    githubLink: "https://github.com/Ibadatt-2k/diabetes-risk-predictor",
    icon: "🔬",
    color: "#1f2937",
  },
  {
    id: 2,
    title: "Web Scraping Tool",
    description:
      "Robust web scraper built with Python and BeautifulSoup4 that extracts and organizes data from multiple websites. Includes error handling, data export to CSV/JSON.",
    liveLink: "https://www.youtube.com/watch?v=QhD015WUMxE",
    githubLink: "https://github.com/Ibadatt19/Web-Scrapping-Tool",
    icon: "🕸️",
    color: "#1f2937",
  },
  {
    id: 3,
    title: "GitHub Contribution Automator",
    description:
      "Automation tool that streamlines GitHub workflows using the GitHub API. Automates pull request creation, issue tracking, and commit management with configurable workflows and detailed logging.",
    liveLink: "https://www.youtube.com/watch?v=LlkcvvGbs9I",
    githubLink: "https://github.com/Ibadatt-2k/Typeshii",
    icon: "⚙️",
    color: "#1f2937",
  },
]

export default function Projects() {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <section id="projects" className={styles.container}>
      <div className={styles.header}>
        <h1 className="sectionTitle">Projects</h1>
      </div>

      <div className={styles.projectsContainer}>
        {projects.map((project) => (
          <div
            key={project.id}
            className={styles.projectCard}
            onMouseEnter={() => setHoveredId(project.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              "--accent-color": project.color,
            }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.icon}>{project.icon}</span>
              <h3 className={styles.title}>{project.title}</h3>
            </div>

            <p className={styles.description}>{project.description}</p>

            <div className={styles.buttonGroup}>
              <a
                href={project.liveLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.button} ${styles.primary}`}
              >
                <span>Live Demo</span>
                <span className={styles.arrow}>→</span>
              </a>
              <a
                href={project.githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`${styles.button} ${styles.secondary}`}
              >
                <span>GitHub</span>
                <span className={styles.arrow}>→</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
