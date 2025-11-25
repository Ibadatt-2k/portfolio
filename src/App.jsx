
import './App.css'
import Contact from './sections/Contact/Contact';
import Footer from './sections/Footer/Footer';
import Hero from './sections/Hero/Hero';
import Projects from './sections/Projects/Projects';
import Skills from './sections/Skills/Skills';
import Experience from './sections/Experience/Experience';
function App() {
  console.log('test')
  return(
  <>
    <Hero />
    <Projects />
    <Experience />
    <Skills />
    <Contact />
    <Footer />
  </>
  );
}

export default App;
