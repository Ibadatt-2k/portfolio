import styles from './SkillsStyles.module.css';
import checkMarkIcon from '../../assets/checkmark-dark.svg';
import SkillList from '../../common/SkillList';
function Skills() {
  return (
    <section id="skills" className={styles.container}>
    <h1 className='sectionTitle'>Skills</h1>
    <div className={styles.skillList}>
       <SkillList src={checkMarkIcon} skill="HTML"/>
       <SkillList src={checkMarkIcon} skill="CSS"/>
       <SkillList src={checkMarkIcon} skill="Java"/>
       <SkillList src={checkMarkIcon} skill="Python"/>
       <SkillList src={checkMarkIcon} skill="Haskell"/>
       <SkillList src={checkMarkIcon} skill="Prolog"/>
       <SkillList src={checkMarkIcon} skill="SQL"/>
    </div>
    <hr />
    <div className={styles.skillList}>
       <SkillList src={checkMarkIcon} skill="React"/>
       <SkillList src={checkMarkIcon} skill="Git"/>
       <SkillList src={checkMarkIcon} skill="AWS"/>
       <SkillList src={checkMarkIcon} skill="PHP"/>
       <SkillList src={checkMarkIcon} skill="C++"/>
       <SkillList src={checkMarkIcon} skill="Java PDE"/>
       <SkillList src={checkMarkIcon} skill="Flutter"/>
    </div>
    <hr />
    <div className={styles.skillList}>
       <SkillList src={checkMarkIcon} skill="Pandas"/>
       <SkillList src={checkMarkIcon} skill="BeautifulSoup"/>
       <SkillList src={checkMarkIcon} skill="Git Ignore"/>
       <SkillList src={checkMarkIcon} skill="AQ/UT testing"/>
       <SkillList src={checkMarkIcon} skill="CLI"/>
       <SkillList src={checkMarkIcon} skill="Windows Server Installation"/>
       <SkillList src={checkMarkIcon} skill="Linux"/>
    </div>
    <hr />
    </section>
    )
}

export default Skills;