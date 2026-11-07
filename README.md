# WarLike Library

Bibliothèque créative indépendante de l’écosystème WarLike. Interface en français, adaptée au bureau et au mobile. HTML/CSS/JavaScript natifs ; aucune installation nécessaire côté utilisateur.

## Fonctions disponibles

- 23 ressources intégrées : 9 modèles GLB réels Kenney/Quaternius, 6 sprites PNG, 2 sons OGG et 6 scripts WarLike. Les fichiers sont fournis avec l’application, pas seulement liés à un catalogue externe.
- Recherche par nom, collection et tags ; filtres par type et modèles animés ; tri, vues grille/liste, favoris, collections et corbeille récupérable.
- Import multiple et glisser-déposer : GLB embarqués, PNG/JPEG/WebP/GIF, audio, vidéo, scripts et documents. Limite 32 Mo/fichier ; doublons SHA-256 évités.
- Aperçus images, audio/vidéo, texte et modèles 3D. Le lecteur 3D Google model-viewer 4.1.0 est chargé uniquement à l’ouverture d’un GLB ; il nécessite Internet et WebGL. Les vignettes et téléchargements restent disponibles sans WebGL.
- Création de scripts WarScript (.wls), JavaScript (.js), TypeScript (.ts) et C# (.cs) avec modèles de départ. Éditeur avec numéros de lignes, indentation Tab, position du curseur, Ctrl/Cmd+S, protection des changements non enregistrés et téléchargement. Modifier un exemple intégré crée une copie personnelle.
- Données et fichiers conservés dans IndexedDB dans ce navigateur. Les scripts et fichiers ne sont pas envoyés à un serveur. Sauvegarde JSON incluant les fichiers personnels, restauration validée puis écrite en une transaction. Les ressources intégrées sont référencées dans la sauvegarde et fournies par cette version de l’application.

## Guerre moderne

Une collection comprend un soldat moderne stylisé, un fusil d’assaut, un blindé animé et quatre comportements de jeu :

| Script | Fonctionnement et branchements |
| --- | --- |
| SoldatDeplacement.wls | ZQSD, sprint Maj, collisions par Move. Désactiver un autre contrôleur de déplacement concurrent. |
| ChargeurFusil.wls | F pour tir automatique, R pour recharge de 2 s, chargeur 30 et réserve 90. Déclenche les triggers Animator shootRequest/reloadRequest et le signal weapon:shot. Relier ce signal aux dégâts/projectiles dans Blueprint : ce script ne calcule pas de trajectoire ou de dégâts. |
| Patrouille.js | Aller-retour sur X, vitesse/distance configurables, déplacement via l’API de collisions du moteur. |
| CaptureObjectif.js | Capture par équipe, pause si contestation, exclusion des acteurs morts, signal objectif:captured. Relier ce signal au score/HUD. |

Télécharger le script puis l’importer dans Script Studio de WarLike Engine. Library édite du code ; elle n’exécute ni ne compile C#/TypeScript dans son propre onglet. Le TypeScript demande compilation dans Engine ; C# s’exécute via le pont .NET local. Aucun transfert silencieux entre les applications n’est implémenté.

## Développement

```sh
npm run check
npm test
python3 -m http.server 8000
```

Ouvrir http://localhost:8000. Déploiement statique : dossier racine du dépôt, sans commande de compilation. Le workflow GitHub vérifie la syntaxe, les fichiers réels, les filtres, la sauvegarde et les comportements militaires JS.

## Données et limites

IndexedDB est propre à l’origine et au profil du navigateur : exporter une sauvegarde avant d’effacer les données du navigateur ou de changer d’appareil. Pas de synchronisation cloud, de compte utilisateur ni d’exécution du code fourni. Les documents PDF/ZIP sont téléchargeables ; leur rendu interne n’est pas implémenté. Les GLB avec fichiers externes sont refusés : intégrer les textures/buffers dans le GLB.

## Licences

Code de l’application et scripts WarLike : MIT (voir LICENSE). Assets Kenney/Quaternius : CC0-1.0 ; auteurs et sources exactes dans assets/catalog.json. Notices conservées dans assets/KENNEY-LICENSE.md et assets/QUATERNIUS-LICENSE.md. Google model-viewer est un composant tiers Apache-2.0 chargé depuis https://ajax.googleapis.com/ajax/libs/model-viewer/4.1.0/model-viewer.min.js.

## WarLike Asset Store — point d'entrée de la bibliothèque

[Explorer les départements](./store.html) depuis le bouton **Asset Store** de l'interface principale.

Cette page donne accès aux rayons spécialisés de WarLike Engine : **Armes**, **Maisons & bâtiments**, **Animations**, **Matériaux & textures**, **Prefabs 3D**, **Sprites/Prefabs 2D**, et **Audio/UI**. Elle présente séparément les **23 ressources réellement incluses** dans le dépôt WarLike-Library depuis `assets/catalog.json` (recherche, filtrage, provenance, licences et téléchargement des fichiers), sans en inventer de nouvelles.

**Frontière fonctionnelle :** les ressources des rayons Engine sont hébergées sur `warlike-engine.pages.dev`. Library ne les réhéberge pas et n'annonce aucun import inter-domaines ou synchronisation : le navigateur isole les bases IndexedDB de ces deux origines. Une éventuelle fédération et une installation Engine ↔ Library devront utiliser un protocole d'import/export explicite ou une API contrôlée.

La syntaxe du script de cette nouvelle page a été vérifiée ; navigation, fichiers téléchargeables et publication Cloudflare nécessitent encore une validation en navigateur.

## Pack Game Assets — ressources supplémentaires pour créer des jeux

La bibliothèque contient désormais **83 ressources intégrées**, dont **18 ressources du pack Game Assets** : **12 sprites vectoriels 2D SVG** et **6 modèles 3D glTF 2.0 autonomes**. Les catégories couvertes comprennent **RPG, FPS/TPS, RTS, simulation, horreur, sport et plateforme 2D**. Exemples : mage, squelette, médecin tactique, boîte de munitions, centre de commandement, minerais, comptoir, tracteur, clé, œil spectral, ballon, cristal ; puis caisse militaire, radar, étal de marché, autel, coffre et but de football en 3D.

Tous ces fichiers sont **présents dans `assets/community/`** et catalogués dans `assets/catalog.json` avec leur auteur WarLike, licence MIT, catégorie et taille réelle tirée des métadonnées GitHub. Les SVG sont des dessins originaux exploitables comme illustrations/sprites statiques ; ils n'ont pas de rig ni de frames d'animation. Les glTF sont des modèles *low-poly* originaux avec géométrie et buffers embarqués, sans mouvements/IA/physique prédéfinis. Ils sont autonomes mais ne constituent pas des prefabs 3D directement jouables. Les imports et aperçus SVG/glTF sont gérés par la Library, sous réserve de prise en charge WebGL pour les aperçus 3D.

Le test `tests/game-assets-library.test.mjs` contrôle le catalogue, les chemins locaux, la présence des fichiers et la structure des ressources. Pour consulter les fichiers : `store.html` ou l'interface principale Library.

## Extension guerre moderne — véhicules et structures 3D

Deux modèles glTF 2.0 autonomes originaux sont ajoutés à `assets/community/` et indexés dans le catalogue :

- `modern-tactical-4x4.gltf` : véhicule tactique low-poly avec 4 roues, cabine, vitrage, carrosserie et tourelle décorative (984 triangles).
- `modern-checkpoint.gltf` : poste de contrôle fortifié low-poly, poste d’observation, couverture, murs et mobilier (464 triangles).

Ces modèles ont une géométrie 3D réelle (positions de sommets finies et buffers intégrés), mais **ne sont pas des assets photoréalistes ni des prefabs jouables complets**. Les systèmes de conduite, de visée, de collisions, d’animation et d’IA restent à configurer dans WarLike Engine. Les deux maillages sont des créations WarLike sous licence MIT, distinctes des assets Quaternius CC0 du même rayon. Le test `tests/modern-warfare-assets.test.mjs` valide leurs données géométriques embarquées, leurs dimensions et leurs métadonnées.

## Pack Véhicules & Personnages 3D

Quatre nouveaux fichiers glTF 2.0 sont directement inclus dans `assets/community/` et indexés dans `assets/catalog.json` :

- **Véhicules** : `vehicle-scout-buggy.gltf` (buggy tactique, 704 triangles) et `vehicle-armored-carrier.gltf` (blindé 8×8, 1 232 triangles).
- **Personnages** : `character-scout.gltf` (éclaireur équipé, 1 048 triangles) et `character-field-medic.gltf` (médecin de terrain, 1 048 triangles).

Le site Asset Store affiche maintenant deux départements directs **Véhicules 3D** et **Personnages 3D**, liés aux filtres de collection. Chaque modèle contient une vraie géométrie 3D embarquée et est sous licence MIT, mais reste **low-poly non riggé et non animé**. Les personnages demandent un squelette pour l'Animator ; les véhicules exigent des contrôleurs de physique et de conduite avant d'être jouables. Les modèles Kenney/Quaternius déjà livrés restent disponibles. Le test `tests/vehicles-characters.test.mjs` vérifie les coordonnées, buffers et entrées du catalogue.

## Ressources graphiques authentiques Kenney (PNG et GLB)

Neuf fichiers originaux supplémentaires, issus de packs Kenney sous licence **CC0-1.0**, sont désormais inclus dans `assets/kenney/` :

- 3D / Car Kit : `police-car.glb`, `ambulance.glb`, `suv.glb`.
- 3D / Mini Characters : `character-male-b.glb`, `character-female-b.glb`.
- 2D / Topdown Shooter : `topdown-soldier-stand.png`, `topdown-soldier-machine.png`.
- 2D / Pixel Vehicle Pack : `pixel-police.png`, `pixel-buggy.png`.

Les modèles 3D sont accompagnés de cinq vignettes WebP originelles dans `assets/kenney/thumbs/`. Toutes les entrées du catalogue mentionnent **Kenney**, la licence CC0 et la page d'origine. Les GLB sont des modèles artistiques réels, mais l'ajout au catalogue ne signifie pas que chacun est riggé ou préconfiguré comme prefab jouable. Les PNG sont de vrais sprites de jeux, mais le Pixel Vehicle Pack est volontairement du pixel art, pas du photoréalisme. La provenance de ces copies est le dépôt public `Hidencod/tge-assets` pour les modèles 3D et `shorepine/kenney` pour les 2D, reprenant les packs Kenney ; conserver les avis de licence Kenney pour la redistribution.

Le test `tests/authentic-kenney-assets.test.mjs` contrôle la présence, les signatures binaires PNG, GLB et WebP, les tailles et les maillages 3D. La distinction entre originaux Kenney et productions low-poly internes reste explicite dans chaque fiche.

## Sélection authentique 2D / 3D

L'Asset Store propose un filtre **« Packs 2D/3D originaux »** activé par défaut. Cette vue n'affiche que les fichiers réellement intégrés au dépôt (PNG/WebP ou GLB), attribués aux éditeurs Kenney ou Quaternius avec leur source et licence CC0. Les cartes donnent accès au téléchargement du fichier et au lien vers le pack d'origine.

Les maillages procéduraux et sprites vectoriels communautaires restent consultables via **« Tout le catalogue »** ou **« Créations WarLike »** : ils ne sont plus présentés comme des modèles professionnels issus de packs. Les onglets **Sprites PNG 2D** et **Modèles GLB 3D** permettent d'isoler les fichiers sources. L'authenticité de l'auteur et la licence sont fondées sur les métadonnées du catalogue, et les vérifications automatiques contrôlent les fichiers et signatures sans certifier visuellement leur qualité artistique.

Les packs complets externes Kenney (New Platformer Pack, Pixel Platformer) et Quaternius restent à importer avec leurs fichiers et notices de licence avant d'être annoncés comme installés.

## Packs sélectionnés et aperçu 3D dans le Store

Le fichier `assets/packs.json` référence cinq regroupements de ressources effectivement incluses : personnages 3D animés, personnages 3D supplémentaires, véhicules 3D, sprites top-down et sprites plateforme. Les packs sont des **sélections de fichiers**, pas des archives autonomes, des systèmes de conduite ou des prefabs Engine prêts à jouer. Le filtre « Pack » dans `store.html` permet d'afficher les fichiers correspondants.

Le bouton **Aperçu 3D** ouvre le modèle sélectionné dans `model-viewer` ; la scène peut être pivotée et zoomée. Lorsque le GLB contient des animations, l'interface propose leur lecture. Le lecteur chargé depuis Google nécessite Internet/WebGL ; en cas d'échec, le téléchargement du fichier reste disponible. Le Store affiche aussi la présence déclarée d'animations sans inventer de rig pour les modèles statiques.

**Correction de sauvegarde :** `validateBackup` rétablit désormais les fichiers `.gltf` JSON avec leur validateur dédié au lieu de les envoyer au parseur binaire GLB. Les tests couvrent les sauvegardes glTF et les références des packs, ainsi que la syntaxe du script intégré au Store. L'installation directe dans WarLike Engine reste à concevoir et à valider séparément.
