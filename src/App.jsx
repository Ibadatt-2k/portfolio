
import './App.css'
import Contact from './sections/Contact/Contact';
import Footer from './sections/Footer/Footer';
import Hero from './sections/Hero/Hero';
import Projects from './sections/Projects/Projects';
import Skills from './sections/Skills/Skills';
import Experience from './sections/Experience/Experience';

function App() {
  return (
    <>
      <div className="app">
        <Hero />
        <Projects />
        <Experience />
        <Skills />
        <Contact />
        <Footer />
      </div>
    </>
  );
}

export default App;

