import React, { useState, useEffect, useRef } from 'react';

// Lucide React Sparkles Icon (for modern touch)
// If lucide-react were installed, we would import it like:
// import { Sparkles } from 'lucide-react';
// For this environment, we use an inline SVG as a fallback.
const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-sparkles"
  >
    <path d="M9.914 1.437L12 6l2.086-4.563C14.738.835 15.65.94 16 2c.35.94-.562 1.852-1.125 2.5L12 8l-2.875-3.5c-.563-.648-1.475-1.56-1.825-2.5.35-1.06.963-1.165 1.764-1.237z"></path>
    <path d="M18.827 7.749L21 12l-2.173 4.251c-.672 1.31-.225 2.115.673 2.115.898 0 1.345-.805 2.017-2.115L24 12l-2.173-4.251C21.135 6.44 20.688 5.635 19.79 5.635c-.898 0-1.345.805-2.017 2.115z"></path>
    <path d="M1.173 7.749L3 12l-1.827 4.251C.474 17.56.027 18.365.925 18.365c.898 0 1.345-.805 2.017-2.115L6 12l-2.173-4.251C2.712 6.44 2.265 5.635 1.367 5.635c-.898 0-1.345.805-2.017 2.115z"></path>
    <path d="M9.914 22.563L12 18l2.086 4.563c.738 1.628 1.65 1.523 2 0 .35-1.523-.562-2.435-1.125-3.0L12 16l-2.875 3.5c-.563.648-1.475 1.56-1.825 3.0.35 1.523.963 1.628 1.764 1.237z"></path>
  </svg>
);

function App() {
  // Originaldaten für die Slideshow
  const originalSlides = [
    {
      image: "https://placehold.co/800x450/a16207/fff7ed?text=Reetro+Idee+1",
      title: "Klassiker Neu Interpretiert",
      caption: "Alte Geschichten, neue Formate.",
      fullText: "Wir nehmen zeitlose Erzählstrukturen und transformieren sie in immersive digitale Erlebnisse, die die nächste Generation begeistern."
    },
    {
      image: "https://placehold.co/800x450/7c2d12/fff7ed?text=Reetro+Idee+2",
      title: "Design von Gestern für Heute",
      caption: "Retro-Ästhetik trifft moderne Usability.",
      fullText: "Entdecke Benutzeroberflächen, die den Charme vergangener Jahrzehnte bewahren und gleichzeitig intuitiv und hochfunktional sind."
    },
    {
      image: "https://placehold.co/800x450/b45309/fff7ed?text=Reetro+Idee+3",
      title: "Technologie mit Seele",
      caption: "Innovationen, die sich vertraut anfühlen.",
      fullText: "Unsere Produkte integrieren die neuesten Technologien auf eine Weise, die sich organisch anfühlt und an traditionelle Interaktionen erinnert."
    },
    {
      image: "https://placehold.co/800x450/d97706/fff7ed?text=Reetro+Idee+4",
      title: "Nachhaltige Innovationen",
      caption: "Zukunft bauen, Vergangenheit ehren.",
      fullText: "Wir entwickeln nachhaltige Lösungen, die nicht nur zukunftsorientiert sind, sondern auch die Langlebigkeit und Qualität klassischer Produkte widerspiegeln."
    }
  ];

  // Erstelle ein "gelooptes" Array, um nahtloses Scrollen zu ermöglichen
  // Dupliziere die letzte Folie am Anfang und die erste Folie am Ende
  const loopedSlides = [
    originalSlides[originalSlides.length - 1], // Duplikat der letzten Folie
    ...originalSlides, // Originale Folien
    originalSlides[0], // Duplikat der ersten Folie
  ];

  // Zustand für den aktuellen Index der Slideshow
  // Beginnt bei 1, da Index 0 die duplizierte letzte Folie ist
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  // Zustand zur Steuerung der CSS-Transition für sofortiges Springen
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  // Breite der einzelnen Folien (als Prozentsatz des Containers)
  const slideWidthPercentage = 70; // Die Hauptfolie nimmt 70% der sichtbaren Breite ein
  // Abstand zwischen den Folien (als Prozentsatz des Containers)
  const gapPercentage = 5; // Erhöhter visueller Abstand zwischen den Folien

  // Berechnet den Transform-Wert, um die aktuelle Folie genau zu zentrieren
  // Die Berechnung sorgt dafür, dass die sichtbaren Ränder (Vorschauen) auf beiden Seiten gleich groß sind.
  const transformValue = `translateX(calc(-${currentSlideIndex * (slideWidthPercentage + gapPercentage)}% + ${50 - slideWidthPercentage / 2}%) )`;

  // Event-Handler für das Ende der CSS-Transition
  // Ermöglicht das "Zurückspringen" an den richtigen Index ohne sichtbare Transition
  const handleTransitionEnd = () => {
    // Wenn die Transition zur duplizierten ersten Folie abgeschlossen ist
    if (currentSlideIndex === loopedSlides.length - 1) {
      setTransitionEnabled(false); // Deaktiviere Transition
      setCurrentSlideIndex(1); // Springe sofort zur tatsächlichen ersten Folie
    }
    // Wenn die Transition zur duplizierten letzten Folie abgeschlossen ist
    else if (currentSlideIndex === 0) {
      setTransitionEnabled(false); // Deaktiviere Transition
      setCurrentSlideIndex(originalSlides.length); // Springe sofort zur tatsächlichen letzten Folie (in geloopten Slides ist das Index `originalSlides.length`)
    }
  };

  // useEffect, um die Transition nach dem Springen wieder zu aktivieren
  useEffect(() => {
    if (!transitionEnabled) {
      // Eine kleine Verzögerung, um sicherzustellen, dass der Browser die Transition deaktiviert hat
      const timeout = setTimeout(() => {
        setTransitionEnabled(true);
      }, 50); // Kurze Verzögerung
      return () => clearTimeout(timeout);
    }
  }, [transitionEnabled]);

  // Funktion zum Wechseln zur nächsten Folie
  const nextSlide = () => {
    setCurrentSlideIndex((prevIndex) => prevIndex + 1);
  };

  // Funktion zum Wechseln zur vorherigen Folie
  const prevSlide = () => {
    setCurrentSlideIndex((prevIndex) => prevIndex - 1);
  };

  return (
    // Hauptcontainer mit voller Viewport-Höhe und einem retro-modernen, helleren bräunlichen Hintergrund
    // Entferne scroll-pt-X, da scroll-mt auf den snap-start Elementen verwendet wird
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-50 text-stone-800 font-inter antialiased flex flex-col items-center p-4 overflow-y-scroll snap-y snap-mandatory">

      {/* Navbar (fixed, so it doesn't snap) */}
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-stone-100 bg-opacity-90 py-4 px-6 flex justify-between items-center shadow-lg border-b border-stone-200">
        {/* Reetro Logo ist jetzt ein anklickbarer Link zum Start des neuen Hero-Bereichs */}
        <a href="#hero" className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-700 to-yellow-800 tracking-tight cursor-pointer">
          Reetro
        </a>
        {/* Navbar-Optionen auf 3 reduziert */}
        <ul className="hidden md:flex space-x-8">
          <li><a href="#vision" className="text-stone-700 hover:text-amber-700 transition-colors duration-200">Vision</a></li>
          <li><a href="#projekte" className="text-stone-700 hover:text-orange-700 transition-colors duration-200">Projekte</a></li>
          <li><a href="#philosophie" className="text-stone-700 hover:text-yellow-800 transition-colors duration-200">Philosophie</a></li>
        </ul>
      </nav>

      {/* Hero Section (die neue Box oberhalb der Slideshow) */}
      {/* snap-start und scroll-mt-24 für korrekte Positionierung nach Navbar */}
      <section id="hero" className="w-full max-w-4xl text-center mt-20 mb-12 py-8 px-6 bg-stone-100 bg-opacity-80 rounded-xl shadow-2xl border border-stone-200 flex-shrink-0 snap-start flex flex-col justify-center items-center scroll-mt-24">
        <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 via-orange-700 to-yellow-800 tracking-tight leading-none mb-4">
          Reetro
        </h1>
        <p className="text-xl md:text-2xl font-medium text-stone-700 flex items-center justify-center space-x-2">
          <span>Bewährte Systeme</span>
          <SparklesIcon /> {/* Modernes Icon */}
          <span>neu gedacht</span>
        </p>
      </section>

      {/* Slideshow Section (snap point) - scroll-mt-24 beibehalten */}
      <section id="slideshow" className="relative w-full max-w-5xl h-96 overflow-hidden rounded-xl shadow-2xl mb-12 flex-shrink-0 snap-start scroll-mt-24">
        <div
          className={`flex h-full items-center ${transitionEnabled ? "transition-transform duration-700 ease-in-out" : ""}`}
          style={{ transform: transformValue }}
          onTransitionEnd={handleTransitionEnd}
        >
          {loopedSlides.map((slide, index) => (
            <div
              key={index}
              className="flex-shrink-0 relative group h-full rounded-xl"
              style={{
                width: `${slideWidthPercentage}%`,
                marginRight: `${gapPercentage}%`,
              }}
            >
              {/* Slideshow Bild */}
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/800x450/a16207/fff7ed?text=Bild+nicht+gefunden"; }}
              />
              {/* Overlay für die initiale Bildunterschrift, wird beim Hover ausgeblendet */}
              <div className="absolute inset-0 bg-stone-700 bg-opacity-70 flex flex-col items-center justify-center p-8 text-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 rounded-xl">
                <h3 className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {slide.title}
                </h3>
                <p className="text-xl md:text-2xl text-stone-200">{slide.caption}</p>
              </div>
              {/* Overlay für den vollständigen Text, wird beim Hover eingeblendet */}
              <div className="absolute inset-0 bg-stone-600 bg-opacity-90 flex flex-col items-center justify-center p-8 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                <h3 className="text-4xl md:text-5xl font-bold text-amber-300 mb-2">
                  {slide.title}
                </h3>
                <p className="text-xl md:text-2xl text-stone-200">{slide.fullText}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Navigationspfeile */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-stone-600 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-80 transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-75"
          aria-label="Vorherige Folie"
        >
          &lt;
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-stone-600 bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-80 transition-all duration-300 z-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-75"
          aria-label="Nächste Folie"
        >
          &gt;
        </button>

        {/* Indikatoren (Punkte) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {originalSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlideIndex(index + 1)}
              className={`w-3 h-3 rounded-full ${
                (index + 1 === currentSlideIndex ||
                 (currentSlideIndex === 0 && index === originalSlides.length - 1) ||
                 (currentSlideIndex === loopedSlides.length - 1 && index === 0))
                  ? 'bg-amber-600'
                  : 'bg-stone-400'
              } hover:bg-amber-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-75`}
              aria-label={`Gehe zu Folie ${index + 1}`}
            ></button>
          ))}
        </div>
      </section>

      {/* Content Section - Re-implemented with staggered layout */}
      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

        {/* Card 1: Vision (snap point) - scroll-mt-24 hinzugefügt */}
        <section id="vision" className="bg-stone-100 bg-opacity-80 p-8 rounded-xl shadow-lg border border-stone-200 hover:shadow-xl transition-shadow duration-300 flex-shrink-0 snap-start scroll-mt-24">
          <h2 className="text-3xl font-bold text-amber-700 mb-4">Unsere Vision</h2>
          <p className="text-stone-700 leading-relaxed">
            Bei Reetro glauben wir daran, dass die besten Ideen zeitlos sind. Wir nehmen bewährte Konzepte aus der Vergangenheit und hauchen ihnen neues Leben ein, indem wir sie mit modernster Technologie und Designphilosophie verbinden. Entdecke, wie wir das Vertraute neu definieren.
          </p>
        </section>

        {/* Card 2: Projekte (snap point) - scroll-mt-24 hinzugefügt */}
        <section id="projekte" className="bg-stone-100 bg-opacity-80 p-8 rounded-xl shadow-lg border border-stone-200 hover:shadow-xl transition-shadow duration-300 flex-shrink-0 snap-start scroll-mt-24">
          <h2 className="text-3xl font-bold text-orange-700 mb-4">Unsere Projekte</h2>
          <p className="text-stone-700 leading-relaxed">
            Von der Neugestaltung klassischer Benutzeroberflächen bis zur Entwicklung innovativer Tools, die auf traditionellen Prinzipien basieren – unsere Projekte sind eine Brücke zwischen Gestern und Morgen. Tauche ein in eine Welt, wo Nostalgie auf Innovation trifft.
          </p>
        </section>

        {/* Card 3: Philosophie (snap point, spans two columns) - scroll-mt-24 hinzugefügt */}
        <section id="philosophie" className="md:col-span-2 bg-stone-100 bg-opacity-80 p-8 rounded-xl shadow-lg border border-stone-200 hover:shadow-xl transition-shadow duration-300 mb-12 flex-shrink-0 snap-start scroll-mt-24">
          <h2 className="text-3xl font-bold text-yellow-800 mb-4">Unsere Philosophie</h2>
          <p className="text-stone-700 leading-relaxed">
            Jedes unserer Projekte wird mit größter Sorgfalt und einem tiefen Verständnis für die Wurzeln der Idee entwickelt. Wir respektieren die Vergangenheit, während wir die Zukunft gestalten, um Lösungen zu schaffen, die sowohl funktional als auch ästhetisch ansprechend sind.
          </p>
        </section>

      </main>

      {/* Footer (snap point) - scroll-mt-24 hinzugefügt */}
      <footer className="w-full max-w-4xl text-center py-6 px-6 bg-stone-100 bg-opacity-80 rounded-xl shadow-xl border border-stone-200 mt-8 flex-shrink-0 snap-start scroll-mt-24">
        <p className="text-stone-600 text-sm">&copy; {new Date().getFullYear()} Reetro. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
}

export default App;
