# Animations Lottie

## Fichiers disponibles

| Fichier | Description | Source | Utilisé dans |
|---------|-------------|--------|--------------|
| `magic-wand.json` | Baguette magique avec sparkles | Créé manuellement | MagicLoader (type: wand) |
| `loading-stars.json` | 4 étoiles qui pulsent | Créé manuellement | MagicLoader (type: sparkle) |
| `confetti.json` | Confettis multicolores | Créé manuellement | MagicLoader (type: unicorn) |
| `star-favorite.json` | Étoile animée (favoris) | GitHub spemer/lottie-animations-json | MagicLoader (type: star) |
| `fireworks.json` | Feux d'artifice | GitHub xvrh/lottie-flutter | Non utilisé |
| `twitter-heart.json` | Coeur avec particules | Créé manuellement | Non utilisé |
| `thumbs-up.json` | Pouce levé avec sparkles | Créé manuellement | Non utilisé |
| `success-check.json` | Check de validation | Créé manuellement | Non utilisé |

## Outils de conversion SVG vers Lottie

### A étudier

1. **lottie-web** (JS)
   - Repo: https://github.com/airbnb/lottie-web
   - Usage: Rendu Lottie dans le navigateur
   - Note: Ne convertit pas SVG → Lottie directement

2. **svg-to-lottie** (npm)
   - Package: `npm install svg-to-lottie`
   - Usage: Conversion programmatique SVG → Lottie JSON
   - Limitation: SVG statiques uniquement, pas d'animation

3. **Recraft AI** (web)
   - URL: https://www.recraft.ai
   - Workflow: Image/SVG → Vectorisation → Export Lottie
   - Avantage: Gratuit, interface simple
   - Limitation: Pas d'API, manuel uniquement

4. **LottieFiles Creator** (web)
   - URL: https://lottiefiles.com/ai
   - Feature: Motion Copilot génère keyframes depuis texte
   - Powered by: Groq AI
   - Limitation: Compte requis

5. **Bodymovin** (After Effects plugin)
   - Prix: $20 ou gratuit via GitHub
   - Workflow: After Effects → Export JSON
   - Standard: Le plus utilisé professionnellement

6. **Keyshape** (Mac)
   - Prix: $29.99
   - Workflow: Animation 2D native → Export Lottie
   - Avantage: Interface simple, achat unique

## Structure JSON Lottie

```json
{
  "v": "5.7.4",        // Version Lottie
  "fr": 30,            // Frame rate
  "ip": 0,             // In point (frame début)
  "op": 60,            // Out point (frame fin)
  "w": 100,            // Largeur
  "h": 100,            // Hauteur
  "nm": "Animation",   // Nom
  "ddd": 0,            // 3D (0=non, 1=oui)
  "assets": [],        // Assets externes
  "layers": [          // Calques d'animation
    {
      "ty": 4,         // Type (4=shape)
      "nm": "Layer",   // Nom du calque
      "ks": {},        // Transform (position, scale, rotation, opacity)
      "shapes": []     // Formes vectorielles
    }
  ]
}
```

## Types de layers (ty)

- `0`: Precomp (composition)
- `1`: Solid
- `2`: Image
- `3`: Null
- `4`: Shape
- `5`: Text

## Génération avec LLM local

Les modèles de code (qwen2.5-coder, deepseek-coder) peuvent générer du JSON Lottie
mais sans fine-tuning spécifique, les résultats sont approximatifs.

Pipeline recommandé:
```
[Prompt texte] → [LLM] → [SVG] → [svg-to-lottie] → [JSON Lottie]
```
