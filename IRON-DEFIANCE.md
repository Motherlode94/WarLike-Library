# Iron Defiance — installation des GLB Meshy dans WarLike Library

Ouvrir `iron-defiance.html` depuis la même origine que la bibliothèque. Les 12 modèles Meshy ont été générés séparément et leurs identifiants se trouvent dans le manifeste du dépôt WarLike Engine.

1. Dans Meshy, ouvrir chaque génération terminée et télécharger son **GLB texturé**.
2. Renommer les fichiers selon les IDs `ID-INF-01.glb` à `ID-ENV-02.glb`.
3. Importer les GLB depuis `iron-defiance.html` (maximum 32 Mo par fichier).
4. Chaque GLB est analysé, haché SHA-256 et enregistré dans IndexedDB sous `meshy-ID-...`, collection `Iron Defiance`.
5. Les modèles apparaissent ensuite dans la page principale de Library et peuvent être exportés vers Engine via le Pack Builder.

Les modèles ne sont **pas** téléchargés automatiquement depuis Meshy : les liens de téléchargement sont temporaires et doivent être demandés depuis l'espace Meshy autorisé.

La page ne stocke pas de jeton Meshy et ne transmet pas les fichiers au serveur. IndexedDB est limité à l'origine du navigateur et aux quotas de stockage ; sauvegarder les GLB dans un dossier sécurisé et dans un backup personnel. Les fichiers téléchargés ne sont pas nécessairement riggés et ne contiennent pas forcément les pivots d'animation attendus par WarLike Rig Studio.
