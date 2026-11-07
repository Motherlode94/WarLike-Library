# WarLike Library

Bibliothèque créative indépendante de l’écosystème WarLike. Interface en français, adaptée au bureau et au mobile. HTML/CSS/JavaScript natifs ; aucune installation nécessaire côté utilisateur.

## Fonctions disponibles

- **469 ressources intégrées** : **189 modèles 3D**, **272 images 2D**, 6 scripts et 2 sons. Parmi elles, **386 véritables fichiers Kenney CC0 supplémentaires** ont été importés en novembre 2026 : 154 GLB avec leurs vignettes WebP, et 232 PNG. Les fichiers sont fournis dans le dépôt et dans le site publié, pas seulement référencés comme liens externes. Les ressources WarLike procédurales sont toujours distinguées des modèles d'origine.
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

## Inspection 2D et 3D renforcée

Le Store propose désormais un bouton **Aperçu 2D** sur les fichiers image : visualisation du fichier original, dimensions réelles en pixels, zoom de 25 à 800 %, fond damier pour distinguer la transparence et rendu « Pixel net » (sans interpolation) commutable. Cela ne transforme pas une image statique en spritesheet animé.

Dans l'**Aperçu 3D**, `js/asset-inspection.js` analyse les fichiers GLB et glTF embarqués et expose les informations vérifiables de leurs scènes : nombre de maillages, primitives, sommets, triangles estimés selon les modes de primitives, matériaux, textures, skins et clips d'animation. Les animations disponibles sont lues dans le viewer lorsque le modèle les fournit. La présence d'un skin ne garantit pas à elle seule un personnage prêt à être joué : l'Animator et les comportements Engine doivent encore être configurés.

Les fonctionnalités d'aperçu opèrent sur les assets existants et **n'ajoutent pas de faux personnages ni de modèles externes**. L'inspection client ne rend pas un modèle photoréaliste ou prêt pour la physique du moteur.

## Prefab Studio et transfert réel vers WarLike Engine (beta)

La page [Prefab Studio](https://warlike-library.pages.dev/prefab-studio.html) offre une interface pour créer des prefabs à partir des assets 2D/3D déjà catalogués, configurer Transform, Renderer, Collider, Animator et Rigidbody et enregistrer des **variantes héritant du prefab parent**. Les configurations sont validées et enregistrées localement dans le navigateur. Le Store comporte un bouton **Créer un prefab** pour les fichiers 2D/3D.

Pour les **modèles GLB 3D**, **Exporter pour Engine** télécharge désormais un fichier `.wlpkg.json` contenant les vrais octets du modèle, le prefab résolu et une empreinte SHA-256. Sur [l'importateur de WarLike Engine](https://warlike-engine.pages.dev/asset-store/library-import.html), sélectionner ce fichier : le moteur vérifie les données, conserve le GLB dans IndexedDB sur **son propre domaine** et installe un prefab natif référant au modèle. Les variantes sont exportées avec leurs propriétés héritées résolues ; leurs dépendances parentes ne sont pas synchronisées automatiquement après import.

Les imports dans la bibliothèque principale contrôlent désormais davantage de signatures de fichiers (PNG/JPEG/WebP/GIF/SVG et GLB/glTF) ; un glTF à textures ou buffers externes est refusé plutôt qu'enregistré avec des dépendances manquantes.

**Limites actuelles :** seul le transfert GLB 3D est implémenté de bout en bout au niveau stockage local ; le transfert des PNG 2D, les glTF multi-fichiers, l'import automatique sans téléchargement, et le packaging des fichiers 3D importés dans les exports de jeux restent incomplets. Aucun compte cloud ou stockage distant utilisateur n'est opérationnel : un schéma D1 et une architecture de sécurité sont préparés sous `cloud/`, sans service de connexion déployé. Les tests automatiques ne remplacent pas un test Scene → Play → Export dans le navigateur.

## Import massif de véritables assets 2D et 3D Kenney (novembre 2026)

Le répertoire `assets/kenney-expanded/` contient **154 modèles 3D GLB**, **232 sprites PNG** et **154 vignettes WebP** provenant de packs Kenney sous licence CC0-1.0. Les ressources couvrent notamment : Mini Characters, Blocky Characters, Car Kit, City Kit, Castle Kit, Nature Kit, Furniture Kit, Space Kit, Graveyard Kit, Blaster Kit, Tower Defense, Topdown Shooter, RTS Medieval, RTS Sci-fi, Racing Pack, New Platformer Pack et Toon Characters.

Ces fichiers ont été importés **en octets originaux depuis des commits épinglés** des dépôts [Hidencod/tge-assets](https://github.com/Hidencod/tge-assets) (3D) et [shorepine/kenney](https://github.com/shorepine/kenney) (2D). Chaque entrée documente son origine, sa révision, sa licence, sa taille et son SHA-256. Le fichier `assets/import-queue.json` répertorie la sélection exacte ; le script `scripts/import-kenney-packs.mjs` télécharge et vérifie les fichiers depuis les sources publiques, puis génère les fiches. L'action GitHub `import-real-assets.yml` exécute l'import et ses tests avant le commit. Cette opération n'invente aucun modèle : tous les GLB et PNG sont effectivement intégrés au dépôt.

**À noter :** Kenney propose principalement des assets stylisés ou low-poly. Un GLB authentique n'est pas automatiquement un personnage riggé, un véhicule conduisible, ni un prefab jouable. Les sprites PNG sont des images individuelles, pas forcément des animations intégrales. Les fichiers et vignettes sont authentiques, mais le rendu AAA, le rigging, la physique et l'intégration Gameplay doivent être évalués séparément.

Avec le nouveau volume, l'Asset Store charge 48 fiches à la fois, puis permet d'en afficher davantage sans saturer immédiatement la page. Le catalogue est organisé en 31 regroupements de packs (dont les 5 regroupements historiques).
