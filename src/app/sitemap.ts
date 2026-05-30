import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/products-data";

const BASE = "https://axionpad.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const products = getAllProducts();

  const productUrls: MetadataRoute.Sitemap = products
    .filter(p => !p.comingSoon)
    .map(p => ({
      url: `${BASE}/shop/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: p.slug === "axion-pad-standard" ? 0.9 : 0.7,
    }));

  return [
    { url: BASE,                    lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/shop`,          lastModified: new Date(), changeFrequency: "weekly",  priority: 0.9 },
    { url: `${BASE}/software`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/about`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/cgv`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.2 },
    ...productUrls,
  ];
}
