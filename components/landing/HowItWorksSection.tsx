const etapes = [
  {
    numero: "01",
    titre: "On surveille Planity",
    description:
      "Toutes les 5 minutes, notre robot vérifie les plannings des salons partenaires et repère les annulations.",
  },
  {
    numero: "02",
    titre: "Le créneau est mis en avant",
    description:
      "Le créneau libéré apparaît avec son tarif réduit, sa durée et la prestation exacte du salon.",
  },
  {
    numero: "03",
    titre: "Tu réserves en quelques secondes",
    description:
      "Premier arrivé, premier servi. Tu confirmes directement depuis la notification.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="comment-ca-marche"
      className="bg-bayclic-cream-2 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <span className="font-mono text-xs uppercase tracking-widest text-bayclic-stone">
          Comment ça marche
        </span>
        <h2 className="mt-3 font-display text-3xl uppercase tracking-tight text-bayclic-ink sm:text-4xl">
          Du planning du salon à ton téléphone, en direct
        </h2>

        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {etapes.map((etape, index) => (
            <div key={etape.numero} className="relative">
              <span className="font-display text-5xl text-bayclic-stone-light">
                {etape.numero}
              </span>
              <h3 className="mt-3 font-display text-lg uppercase tracking-tight text-bayclic-ink">
                {etape.titre}
              </h3>
              <p className="mt-2 font-mono text-sm leading-relaxed text-bayclic-stone">
                {etape.description}
              </p>
              {index < etapes.length - 1 && (
                <div
                  aria-hidden="true"
                  className="absolute right-[-1.25rem] top-2 hidden h-px w-8 bg-bayclic-stone-light sm:block"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
