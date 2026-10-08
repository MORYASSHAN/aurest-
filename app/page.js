import Ambient from '@/components/Ambient';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Story from '@/components/Story';
import About from '@/components/About';
import Technology from '@/components/Technology';
import Vision from '@/components/Vision';
import Founder from '@/components/Founder';
import Partners from '@/components/Partners';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Ambient />
      <Nav />
      <main>
        <Hero />
        <Story />
        <About />
        <Technology />
        <Vision />
        <Founder />
        <Partners />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
