import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Geist, Geist_Mono, Archivo_Black } from "next/font/google";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  weight: "400",
  variable: "--font-archivo-black",
  subsets: ["latin"],
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <main
        className={`${geistSans.variable} ${geistMono.variable} ${archivoBlack.variable}`}
      >
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
