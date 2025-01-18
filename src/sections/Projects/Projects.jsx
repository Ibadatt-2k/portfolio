import styles from './ProjectsStyles.module.css';
import flutter from '../../assets/flutter.png';
import grassfire from '../../assets/grassfire.png';
import ProjectCard from '../../common/ProjectCard';
import webscrapping from '../../assets/webscrapping.png';
import alexa from '../../assets/alexa.png';
function Projects(){
    return(
    <section id="projects" className={styles.container}>
        <h1 className='sectionTitle'>Projects</h1>
        <div className={styles.projectsContainer}>
            <ProjectCard
            src={flutter}
            link="https://github.com/Ibadatt19/pomodroTimer"
            h3=' Flutter'
            p="time/schedule App"
            />
            <ProjectCard
            src={grassfire}
            link="https://github.com/Ibadatt19/Project-COMP-380"
            h3='Grass Fire'
            p="Algorithm"
            />
            <ProjectCard
            src={webscrapping}
            link="https://github.com/Ibadatt19/Web-Scrapping-Tool"
            h3='Web Scrapping Tool'
            p="Python based project"
            />
            <ProjectCard
            src={alexa}
            link="https://github.com/Ibadatt19/beta-Alexa-mod/tree/master"
            h3='Data analysis model'
            p="Alexa/AWS"
            />
        </div>
    </section>
    );
}

export default Projects;
