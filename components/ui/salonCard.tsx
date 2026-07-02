import * as React from "react"
import {Card, CardTitle, CardDescription} from "./card"
import {Button} from "./button"
import Link from 'next/link'

interface SalonProps {
  salon: {
    id: string;
    nom: string;
    nomGerant: string;
    tel: string;
    mail: string;
  }
}

export default function SalonCard({salon} : SalonProps){

    return(
        <>

        <div className="w-50 justify-center">
            <Card>
                <CardTitle>{salon.nom}</CardTitle>
                <CardDescription>Salon de coiffure</CardDescription>
                <Link href={`/salons/${salon.id}`}><Button className="bg-amber-100 text-black">Réservation tarif réduit</Button></Link>
            </Card>
            </div>

        </>
    )
}