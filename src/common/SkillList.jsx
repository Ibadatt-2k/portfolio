
function SkillList({src, skill}) {
  return (
    <span>
        <img src={src} alt="Checlmark icon.." />
        <p>{skill}</p>
    </span>
  )
}

export default SkillList