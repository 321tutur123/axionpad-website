import Link from "next/link";

export const metadata = {
  title: "Mentions légales — Axion Pad",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[#16130E] font-semibold text-lg mb-4 pb-3 border-b border-[#16130E]/12">{title}</h2>
      <div className="text-[#6A6453] text-sm leading-relaxed space-y-2">{children}</div>
    </section>
  );
}

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen bg-[#EFE9DC] pt-20">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <nav className="flex items-center gap-2 text-sm text-[#9A9180] mb-10">
          <Link href="/" className="hover:text-[#6A6453] transition-colors">Accueil</Link>
          <span>›</span>
          <span className="text-[#16130E]">Mentions légales</span>
        </nav>

        <h1 className="text-3xl font-bold text-[#16130E] mb-2">Mentions légales</h1>
        <p className="text-[#6A6453] text-sm mb-12">
          Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance
          en l'économie numérique.
        </p>

        <Section title="1. Éditeur du site">
          <p>Le site axionpad.fr est édité par :</p>
          <p>
            <strong className="text-[#16130E]">Arthur Delacour</strong><br />
            Activité : vente en ligne de matériel électronique<br />
            Statut : Auto-entrepreneur / Micro-entrepreneur<br />
            SIRET : <span className="text-[#6A6453]">[À COMPLÉTER]</span><br />
            Adresse : <span className="text-[#6A6453]">[À COMPLÉTER]</span><br />
            Email : <a href="mailto:contact@axionpad.fr" className="text-[#E8431F] hover:text-[#E8431F]">contact@axionpad.fr</a>
          </p>
        </Section>

        <Section title="2. Directeur de la publication">
          <p>Arthur Delacour — contact@axionpad.fr</p>
        </Section>

        <Section title="3. Hébergement">
          <p>
            Le site est hébergé par :<br />
            <strong className="text-[#16130E]">Vercel Inc.</strong><br />
            340 Pine Street, Suite 801, San Francisco, CA 94104, USA<br />
            <a href="https://vercel.com" className="text-[#E8431F] hover:text-[#E8431F]">vercel.com</a>
          </p>
        </Section>

        <Section title="4. Propriété intellectuelle">
          <p>
            L'ensemble du contenu du site (textes, images, illustrations, logos, icônes, sons, logiciels) est
            la propriété exclusive d'Axion Pad, sauf mention contraire explicite.
          </p>
          <p>
            Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des
            éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation
            écrite préalable.
          </p>
          <p>
            Les schémas PCB et fichiers STL du boîtier sont publiés sous licence{" "}
            <strong className="text-[#16130E]">CERN OHL v2 (Open Hardware Licence)</strong> — voir GitHub.
          </p>
        </Section>

        <Section title="5. Données personnelles">
          <p>
            Le traitement des données personnelles collectées sur ce site est décrit dans notre{" "}
            <Link href="/confidentialite" className="text-[#E8431F] hover:text-[#E8431F] underline">
              politique de confidentialité
            </Link>.
          </p>
        </Section>

        <Section title="6. Cookies">
          <p>
            Le site utilise des cookies strictement nécessaires au fonctionnement du panier et à la session.
            Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
          </p>
        </Section>

        <Section title="7. Responsabilité">
          <p>
            Axion Pad s'efforce d'assurer l'exactitude des informations diffusées sur ce site.
            Toutefois, nous ne saurions garantir l'exactitude, la complétude et l'actualité
            des informations diffusées.
          </p>
          <p>
            Axion Pad ne peut être tenu responsable des dommages directs ou indirects résultant
            de l'utilisation de ce site ou de l'impossibilité d'y accéder.
          </p>
        </Section>

        <Section title="8. Droit applicable">
          <p>
            Le présent site et ses mentions légales sont soumis au droit français.
            En cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </Section>

        <p className="text-xs text-[#16130E] pt-8 border-t border-[#16130E]/8">
          Dernière mise à jour : avril 2026
        </p>

      </div>
    </main>
  );
}
