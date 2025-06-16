# 🚀 Guide de Migration KicksFolio : Rails → Supabase

Ce guide vous accompagne dans la migration complète de votre backend Rails vers Supabase.

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Configuration Supabase](#configuration-supabase)
3. [Migration de la base de données](#migration-de-la-base-de-données)
4. [Migration des données](#migration-des-données)
5. [Migration du frontend](#migration-du-frontend)
6. [Tests et validation](#tests-et-validation)
7. [Déploiement](#déploiement)

## 🎯 Prérequis

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez votre **Project URL** et **API Key (anon public)**

### 2. Installer les dépendances

```bash
cd KicksFolio
npm install @supabase/supabase-js
```

## ⚙️ Configuration Supabase

### 1. Variables d'environnement

Créez un fichier `.env` dans votre dossier KicksFolio :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Mise à jour de la configuration

Modifiez `config/supabase.ts` avec vos vraies clés :

```typescript
export const SUPABASE_CONFIG = {
	url: 'https://your-project.supabase.co',
	anonKey: 'your-anon-key',
	// ... rest of config
};
```

## 🗄️ Migration de la base de données

### 1. Créer le schéma Supabase

1. Ouvrez le **SQL Editor** dans votre dashboard Supabase
2. Copiez le contenu de `supabase-schema.sql`
3. Exécutez le script SQL

### 2. Vérifier la création des tables

Vérifiez dans l'onglet **Table Editor** que les tables suivantes sont créées :

-   `users`
-   `collections`
-   `sneakers`
-   `friendships`

### 3. Configurer le stockage

1. Allez dans **Storage**
2. Vérifiez que les buckets `sneakers` et `profiles` sont créés
3. Configurez les politiques de sécurité si nécessaire

## 📦 Migration des données

### 1. Exporter les données Rails

Dans votre dossier Rails backend :

```bash
cd KicksFolio-Backend
chmod +x scripts/export_data.rb
ruby scripts/export_data.rb
```

Cela va créer les fichiers JSON dans `tmp/supabase_migration/`.

### 2. Importer les données dans Supabase

#### Option A : Via le script de migration (recommandé)

```typescript
import { DataMigration } from './scripts/migrateData';

// Charger vos données exportées
const railsData = {
	users: require('./tmp/supabase_migration/users.json'),
	collections: require('./tmp/supabase_migration/collections.json'),
	sneakers: require('./tmp/supabase_migration/sneakers.json'),
	friendships: require('./tmp/supabase_migration/friendships.json'),
};

// Lancer la migration
await DataMigration.migrateAll(railsData);
```

#### Option B : Import manuel via dashboard

1. Allez dans **Table Editor**
2. Pour chaque table, utilisez **Insert** → **Import data from CSV/JSON**
3. Respectez l'ordre : Users → Collections → Sneakers → Friendships

### 3. Migration des images

Les images devront être migrées séparément vers Supabase Storage.

```typescript
// Exemple pour migrer une image
const imageFile = // votre fichier image
const filePath = `${userId}/${sneakerId}/${Date.now()}.jpg`;

const { data, error } = await supabase.storage
  .from('sneakers')
  .upload(filePath, imageFile);
```

## 📱 Migration du frontend

### 1. Remplacer les anciens services

Remplacez vos anciens appels API par les nouveaux hooks Supabase :

```typescript
// Ancien code
import { useAuth } from './hooks/useAuth';

// Nouveau code
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import { useCollections } from './hooks/useCollections';
import { useSneakers } from './hooks/useSneakers';
import { useFriendships } from './hooks/useFriendships';
```

### 2. Exemple d'utilisation dans un composant

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useCollections } from '../hooks/useCollections';

export default function CollectionScreen() {
	const { user, signOut } = useSupabaseAuth();
	const { collections, loading, createCollection } = useCollections();

	if (loading) return <Text>Chargement...</Text>;

	return (
		<View>
			<Text>Bonjour {user?.first_name}!</Text>
			{collections.map((collection) => (
				<Text key={collection.id}>{collection.name}</Text>
			))}
		</View>
	);
}
```

### 3. Authentification

Mise à jour de vos écrans de connexion/inscription :

```typescript
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

export default function LoginScreen() {
	const { signIn, loading } = useSupabaseAuth();

	const handleLogin = async (email: string, password: string) => {
		await signIn(email, password)
			.then(() => {
				// Redirection vers l'app
				router.replace('/(tabs)');
			})
			.catch((error) => {
				console.error('Erreur de connexion:', error);
			});
	};

	// ... rest of component
}
```

## ✅ Tests et validation

### 1. Tests de base

-   [ ] Inscription d'un nouvel utilisateur
-   [ ] Connexion/déconnexion
-   [ ] Création d'une collection
-   [ ] Ajout d'un sneaker
-   [ ] Upload d'image
-   [ ] Envoi de demande d'amitié

### 2. Tests de données migrées

-   [ ] Les utilisateurs peuvent se connecter avec leurs anciens comptes
-   [ ] Les collections sont bien affichées
-   [ ] Les sneakers sont correctement associés
-   [ ] Les amitiés sont préservées

### 3. Tests de performance

-   [ ] Temps de chargement des listes
-   [ ] Upload d'images
-   [ ] Synchronisation en temps réel

## 🚀 Déploiement

### 1. Mise à jour des variables d'environnement

Configurez vos variables d'environnement pour la production :

```bash
# Production
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

### 2. Build et déploiement

```bash
cd KicksFolio
npx expo build:android  # ou build:ios
```

### 3. Configuration RLS (Row Level Security)

Vérifiez que vos politiques RLS sont bien configurées en production.

## 🔧 Dépannage

### Erreurs communes

#### 1. "Invalid API key"

-   Vérifiez que vos clés Supabase sont correctes
-   Assurez-vous d'utiliser la clé `anon` et non la clé `service_role`

#### 2. "Row Level Security policy violation"

-   Vérifiez vos politiques RLS dans le dashboard Supabase
-   Assurez-vous que l'utilisateur est bien authentifié

#### 3. "Cannot upload to storage"

-   Vérifiez les politiques de votre bucket Storage
-   Assurez-vous que l'utilisateur a les permissions d'upload

#### 4. "UUID invalid"

-   Supabase utilise des UUIDs, pas des IDs entiers comme Rails
-   Vérifiez vos mappings d'IDs lors de la migration

### Ressources utiles

-   [Documentation Supabase](https://supabase.com/docs)
-   [Guide React Native + Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
-   [Communauté Discord](https://discord.supabase.com/)

## 📞 Support

Si vous rencontrez des problèmes lors de la migration :

1. Vérifiez les logs de la console développeur
2. Consultez les logs Supabase dans le dashboard
3. Testez vos requêtes SQL directement dans l'éditeur Supabase

---

**🎉 Félicitations !** Une fois cette migration terminée, vous aurez une application moderne avec Supabase comme backend, bénéficiant de :

-   Authentification intégrée
-   Base de données PostgreSQL performante
-   Stockage de fichiers
-   API temps réel
-   Sécurité Row Level Security
-   Scaling automatique
