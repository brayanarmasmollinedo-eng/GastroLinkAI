import { Chatbot } from "@/modules/ai/chatbot";
import type { Metadata } from "next";
import { DemoProvider } from "@/components/demo-provider";
import "./globals.css";
export const metadata: Metadata = {
  title: "GastroLinkAI | Del origen a tu cocina",
  description:
    "Conecta con ingredientes peruanos y descubre nuevas oportunidades gastronómicas. Prototipo B2B de demostración.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <DemoProvider>
          {children}
          <Chatbot />
        </DemoProvider>
      </body>
    </html>
  );
}
