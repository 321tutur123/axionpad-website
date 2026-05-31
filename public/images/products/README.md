# Photos produits

Pour afficher la photo d'un produit :

1. Dépose l'image **dans ce dossier**.
2. Nomme-la **exactement** comme le `slug` du produit. Extensions acceptées : `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`.
3. Lance `npm run images` (fait aussi automatiquement à chaque `npm run dev` et `npm run build`).

Slugs actuels :

| Fichier à déposer            | Produit          |
|------------------------------|------------------|
| `axion-pad-standard.jpg`     | Axion Pad Elite  |
| `axion-pad-mini.jpg`         | Axion Pad Mini   |
| `kit-pcb.jpg`                | Kit PCB seul     |
| `keycaps-custom.jpg`         | Keycaps custom   |

Pas de photo = affichage du nom du produit en repli (aucune erreur).

## Ordonner les produits

Dans `src/data/products.json`, chaque produit a un champ `"order"` (nombre).
Plus petit = affiché en premier (page d'accueil + boutique). Change les numéros pour réordonner.
