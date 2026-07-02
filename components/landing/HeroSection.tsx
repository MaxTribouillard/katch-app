import { Button } from "@/components/ui/button";
import HeroSchedule from "@/components/landing/HeroSchedule";

export default function HeroSection() {
  return (
    <section className="overflow-hidden bg-bayclic-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-bayclic-stone-light bg-white px-3 py-1 font-mono text-xs text-bayclic-stone">
            Mis à jour toutes les 5 minutes
          </span>

          <h1 className="mt-6 font-display text-4xl uppercase leading-[1.05] tracking-tight text-bayclic-ink sm:text-5xl lg:text-6xl">
            Un créneau{" "}
            <span className="text-bayclic-coral">vient de se libérer</span>{" "}
            chez un coiffeur près de toi
          </h1>

          <p className="mt-6 max-w-md font-mono text-base leading-relaxed text-bayclic-stone">
            Bayclic surveille les annulations de dernière minute dans les
            salons partenaires et te préviens dès qu&apos;un créneau se libère,
            à prix réduit.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="bg-bayclic-green text-white hover:bg-bayclic-green-dark"
            >
              Recevoir les bons plans
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-bayclic-stone-light text-bayclic-ink hover:bg-bayclic-cream-2"
            >
              Je suis un salon
            </Button>
          </div>

          <p className="mt-4 font-mono text-xs text-bayclic-stone">
            Gratuit pour les étudiants. Sans engagement pour les salons.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroSchedule />
        </div>
      </div>
    </section>
  );
}
