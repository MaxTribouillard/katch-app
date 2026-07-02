import { GetServerSideProps } from 'next';

import { prisma } from "../../lib/prisma";

interface SalonProps {
  salon: {
    id: string;
    nom: string;
    nomGerant: string;
    tel: string;
    mail: string;
    prestations: {
      id: string;
      nom: string;
      prix: number;
      duree: number;
    }[];
  } | null;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  // On récupère l'id du salon dans l'URL (ex: /salons/12345)
  const id = context.params?.id as string;

  // On fetch DIRECTEMENT sur la base de données avec Prisma
  const salonData = await prisma.salon.findUnique({
    where: { id: id },
    include: {
      prestations: true, // On embarque les prestations du salon du premier coup !
    },
  });

  // On renvoie la donnée dans les props de la page
  return {
    props: {
      salon: salonData,
    },
  };
};


export default function SalonReservationPage({salon}: SalonProps) {


  if (!salon) return <div className="min-h-screen bg-zinc-950 text-white p-6">Chargement...</div>;

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
      <div className="max-w-2xl mx-auto">

        <div className="border-b border-zinc-800 pb-6 mb-8">
          <span className="text-xs font-mono text-lime-400 uppercase tracking-widest">Réservation Last-Minute</span>
          <h1 className="text-4xl font-black uppercase mt-2 tracking-tight">{salon.nom}</h1>
          <p className="text-zinc-400 text-sm mt-1">{salon.tel}</p>
        </div>

        <h2 className="text-lg font-mono uppercase text-zinc-400 mb-4">// Choisir un créneau disponible</h2>


      </div>
    </main>
  );
}