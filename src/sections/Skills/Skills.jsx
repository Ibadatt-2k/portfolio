import styles from './SkillsStyles.module.css';
import checkMarkIcon from '../../assets/checkmark-dark.svg';
import SkillList from '../../common/SkillList';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

function Skills() {
  const { ref: titleRef, isVisible: titleVisible } = useScrollAnimation({ threshold: 0.3 });
  const { ref: list1Ref, isVisible: list1Visible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: list2Ref, isVisible: list2Visible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: list3Ref, isVisible: list3Visible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section id="skills" className={styles.container}>
    <h1 ref={titleRef} className={`sectionTitle scroll-blur ${titleVisible ? 'visible' : ''}`}>Skills</h1>
    <div ref={list1Ref} className={`${styles.skillList} scroll-blur ${list1Visible ? 'visible' : ''}`}>
       <SkillList src={checkMarkIcon} skill="HTML"/>
       <SkillList src={checkMarkIcon} skill="CSS"/>
       <SkillList src={checkMarkIcon} skill="Java"/>
       <SkillList src={checkMarkIcon} skill="Python"/>
       <SkillList src={checkMarkIcon} skill="Haskell"/>
       <SkillList src={checkMarkIcon} skill="Prolog"/>
       <SkillList src={checkMarkIcon} skill="SQL"/>
    </div>
    <hr />
    <div ref={list2Ref} className={`${styles.skillList} scroll-blur ${list2Visible ? 'visible' : ''}`} style={{ transitionDelay: '0.2s' }}>
       <SkillList src={checkMarkIcon} skill="React"/>
       <SkillList src={checkMarkIcon} skill="Git"/>
       <SkillList src={checkMarkIcon} skill="AWS"/>
       <SkillList src={checkMarkIcon} skill="PHP"/>
       <SkillList src={checkMarkIcon} skill="C++"/>
       <SkillList src={checkMarkIcon} skill="Java PDE"/>
       <SkillList src={checkMarkIcon} skill="Flutter"/>
    </div>
    <hr />
    <div ref={list3Ref} className={`${styles.skillList} scroll-blur ${list3Visible ? 'visible' : ''}`} style={{ transitionDelay: '0.4s' }}>
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