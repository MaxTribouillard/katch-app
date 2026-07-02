import { Button } from "@/components/ui/button";

export default function FinalCtaSection() {
  return (
    <section className="bg-bayclic-cream py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="font-display text-3xl uppercase tracking-tight text-bayclic-ink sm:text-4xl">
          Le prochain créneau bradé peut arriver maintenant
        </h2>
        <p className="mt-4 font-mono text-base text-bayclic-stone">
          Active les notifications et sois le premier à le voir.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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
      </div>
    </section>
  );
}
