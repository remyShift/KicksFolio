# Configuration du Signalement de Bug

Cette fonctionnalité permet aux utilisateurs de signaler des bugs directement depuis l'application mobile en créant automatiquement des issues sur votre repository GitHub.

## ✨ Fonctionnalités

-   **Formulaire intuitif** : Interface simple pour signaler les bugs
-   **Informations automatiques** : Collecte automatique des informations de l'appareil
-   **Création d'issues GitHub** : Génération automatique d'issues sur votre repository
-   **Multilingue** : Support français et anglais
-   **Validation** : Validation des données avant envoi

## 🔧 Configuration Requise

### 1. Token GitHub

Vous devez créer un token GitHub avec les permissions appropriées :

1. Allez sur [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Cliquez sur **"Generate new token"** > **"Generate new token (classic)"**
3. Donnez un nom à votre token (ex: "KicksFolio Bug Reports")
4. Sélectionnez les permissions suivantes :
    - ✅ `repo` (accès complet aux repositories)
5. Cliquez sur **"Generate token"**
6. **Copiez le token** (vous ne pourrez plus le voir après)

### 2. Configuration du Projet

Modifiez le fichier `config/github.config.ts` :

```typescript
export const GITHUB_CONFIG = {
	// Votre nom d'utilisateur GitHub
	REPO_OWNER: 'your-username', // ← Remplacez par votre nom d'utilisateur

	// Le nom de votre repository
	REPO_NAME: 'KicksFolio', // ← Remplacez si nécessaire

	// Votre token GitHub
	GITHUB_TOKEN: 'ghp_xxxxxxxxxxxxxxxxxxxx', // ← Collez votre token ici

	// URL de base (ne pas modifier)
	API_URL: 'https://api.github.com',
} as const;
```

## 🚀 Utilisation

### Pour les Utilisateurs

1. Ouvrez l'application
2. Allez dans **Paramètres** → **Paramètres de l'application**
3. Appuyez sur **"Signaler un bug"**
4. Remplissez le formulaire :
    - **Titre** : Description courte du problème
    - **Description** : Explication détaillée
    - **Étapes pour reproduire** : Instructions step-by-step
    - **Comportement attendu** (optionnel)
    - **Comportement réel** (optionnel)
    - **Priorité** : Faible, Moyenne, ou Élevée
5. Appuyez sur **"Envoyer le rapport"**

### Informations Automatiques

L'application collecte automatiquement :

-   Type et version de l'OS (iOS/Android)
-   Modèle de l'appareil
-   Version de l'application
-   Version de build

## 📋 Structure de l'Issue GitHub

Les issues créées auront la structure suivante :

```markdown
## Description

[Description fournie par l'utilisateur]

## Steps to Reproduce

[Étapes pour reproduire]

## Expected Behavior

[Comportement attendu]

## Actual Behavior

[Comportement réel]

## Device Information

**Device Info:**

-   OS: ios 17.0
-   Device: iPhone 14 Pro
-   App Version: 1.0.0
-   Build Version: 1

## Priority

medium

---

_This issue was automatically created from the mobile app._
```

## 🏷️ Labels Automatiques

Chaque issue créée aura automatiquement les labels suivants :

-   `bug` : Indique que c'est un rapport de bug
-   `mobile-app` : Provient de l'application mobile
-   `priority:low`, `priority:medium`, ou `priority:high` : Selon la priorité choisie

## 🔒 Sécurité

⚠️ **Important** :

-   **Ne commitez JAMAIS votre token GitHub** dans le repository
-   Ajoutez le fichier de configuration à votre `.gitignore` si nécessaire
-   Utilisez des variables d'environnement en production

### Variables d'Environnement (Recommandé)

Pour plus de sécurité, vous pouvez utiliser des variables d'environnement :

```typescript
export const GITHUB_CONFIG = {
	REPO_OWNER: process.env.EXPO_PUBLIC_GITHUB_OWNER || 'your-username',
	REPO_NAME: process.env.EXPO_PUBLIC_GITHUB_REPO || 'KicksFolio',
	GITHUB_TOKEN: process.env.GITHUB_TOKEN || 'your-token-here',
	API_URL: 'https://api.github.com',
} as const;
```

## 🛠️ Personnalisation

### Modifier les Labels

Dans `services/GitHubService.ts`, ligne ~120 :

```typescript
labels: ['bug', 'mobile-app', priorityLabel, 'custom-label'],
```

### Ajouter des Champs

1. Modifiez `BugReportFormData` dans `store/useBugReportStore.ts`
2. Ajoutez les champs dans `components/modals/BugReportModal/index.tsx`
3. Mettez à jour `formatIssueBody` dans `services/GitHubService.ts`

## 🐛 Dépannage

### "GitHub configuration is not properly set up"

-   Vérifiez que vous avez bien modifié `config/github.config.ts`
-   Assurez-vous que le token GitHub est valide

### "GitHub API Error: 401"

-   Le token GitHub est invalide ou expiré
-   Vérifiez les permissions du token (doit avoir accès `repo`)

### "GitHub API Error: 404"

-   Le nom d'utilisateur ou le repository est incorrect
-   Vérifiez `REPO_OWNER` et `REPO_NAME`

### "GitHub API Error: 403"

-   Limite de taux API atteinte
-   Le token n'a pas les permissions nécessaires

## 📝 Notes

-   Les rapports de bug sont créés en tant qu'issues publiques
-   Les utilisateurs n'ont pas besoin de compte GitHub
-   La validation se fait côté client et serveur
-   Les informations sensibles ne sont pas collectées
