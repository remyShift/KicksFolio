# 🔄 Guide de Migration - Nouvelles Traductions

Ce guide documente comment migrer de l'ancienne structure de traductions vers la nouvelle architecture organisée par domaines fonctionnels.

## 📋 Mapping des clés de traduction

### 🏠 **Collection & Sneakers**

| Ancienne clé                                   | Nouvelle clé                               |
| ---------------------------------------------- | ------------------------------------------ |
| `common.titles.collection`                     | `collection.pages.title`                   |
| `common.titles.noSneakers`                     | `collection.pages.empty.title`             |
| `common.buttons.add`                           | `collection.actions.add`                   |
| `common.sneaker.modal.titles.add`              | `collection.modal.titles.add`              |
| `common.sneaker.modal.titles.edit`             | `collection.modal.titles.edit`             |
| `common.sneaker.modal.descriptions.howProceed` | `collection.modal.descriptions.howProceed` |
| `common.sneaker.modal.buttons.bySearch`        | `collection.modal.buttons.bySearch`        |
| `common.sneaker.modal.buttons.edit`            | `collection.modal.buttons.manually`        |
| `common.sneaker.modal.descriptions.searching`  | `collection.modal.descriptions.bySearch`   |
| `common.sneaker.modal.descriptions.manually`   | `collection.modal.descriptions.manually`   |
| `common.sneaker.modal.form.errors.*`           | `collection.modal.form.errors.*`           |
| `common.sneaker.name`                          | `collection.fields.name`                   |
| `common.sneaker.brand`                         | `collection.fields.brand`                  |
| `common.sneaker.size`                          | `collection.fields.size`                   |
| `common.sneaker.filters`                       | `collection.filters.title`                 |
| `common.sneaker.sortBy`                        | `collection.filters.sortBy`                |
| `common.buttons.all`                           | `collection.filters.all`                   |

### 📱 **Messages & Notifications**

| Ancienne clé                                   | Nouvelle clé                                     |
| ---------------------------------------------- | ------------------------------------------------ |
| `common.titles.searchingProgressSneaker`       | `collection.messages.searching.title`            |
| `common.descriptions.searchingProgressSneaker` | `collection.messages.searching.description`      |
| `common.titles.searchingSneaker`               | `collection.messages.found.title`                |
| `common.descriptions.searchingSneaker`         | `collection.messages.found.description`          |
| `common.titles.addingSneaker`                  | `collection.messages.adding.title`               |
| `common.descriptions.addingSneaker`            | `collection.messages.adding.description`         |
| `common.titles.updatingSneaker`                | `collection.messages.updating.title`             |
| `common.descriptions.updatingSneaker`          | `collection.messages.updating.description`       |
| `common.titles.deletingSneaker`                | `collection.messages.deleting.title`             |
| `common.descriptions.deletingSneaker`          | `collection.messages.deleting.description`       |
| `common.titles.sneakerDeleted`                 | `collection.messages.deleted.title`              |
| `common.descriptions.sneakerDeleted`           | `collection.messages.deleted.description`        |
| `common.titles.sneakerDeletionFailed`          | `collection.messages.deletionFailed.title`       |
| `common.descriptions.sneakerDeletionFailed`    | `collection.messages.deletionFailed.description` |

### 👥 **Social & Wishlist**

| Ancienne clé                                      | Nouvelle clé                                   |
| ------------------------------------------------- | ---------------------------------------------- |
| `common.titles.friends`                           | `social.friends.title`                         |
| `common.titles.addFriends`                        | `social.friends.addFriends`                    |
| `common.titles.noFriends`                         | `social.friends.noFriends`                     |
| `common.titles.noWishlist`                        | `social.wishlist.empty.title`                  |
| `common.descriptions.noWishlist`                  | `social.wishlist.empty.description`            |
| `common.titles.sneakerAddedToWishlist`            | `social.wishlist.messages.added.title`         |
| `common.descriptions.sneakerAddedToWishlist`      | `social.wishlist.messages.added.description`   |
| `common.titles.sneakerRemovedFromWishlist`        | `social.wishlist.messages.removed.title`       |
| `common.descriptions.sneakerRemovedFromWishlist`  | `social.wishlist.messages.removed.description` |
| `common.titles.errorUpdatingWishlistStatus`       | `social.wishlist.messages.error.title`         |
| `common.descriptions.errorUpdatingWishlistStatus` | `social.wishlist.messages.error.description`   |

### 🧩 **UI Génériques**

| Ancienne clé            | Nouvelle clé        |
| ----------------------- | ------------------- |
| `common.buttons.add`    | `ui.buttons.add`    |
| `common.buttons.browse` | `ui.buttons.browse` |
| `common.error.global`   | `ui.errors.global`  |
| `common.titles.value`   | `ui.labels.value`   |

### 🧭 **Navigation**

| Ancienne clé             | Nouvelle clé                 |
| ------------------------ | ---------------------------- |
| `common.navbar.home`     | `navigation.navbar.home`     |
| `common.navbar.friends`  | `navigation.navbar.friends`  |
| `common.navbar.profile`  | `navigation.navbar.profile`  |
| `common.navbar.wishlist` | `navigation.navbar.wishlist` |

## 🚀 Exemples de migration

### Avant (ancienne structure)

```typescript
const { t } = useTranslation();

// Titre de la collection
<Title content={t('common.titles.collection')} />

// Bouton d'ajout
<Button title={t('common.buttons.add')} />

// Message de toast
showSuccessToast(
  t('common.titles.sneakerDeleted'),
  t('common.descriptions.sneakerDeleted')
);

// Erreur de formulaire
setErrorMsg(t('common.sneaker.modal.form.errors.sku.required'));
```

### Après (nouvelle structure)

```typescript
const { t } = useTranslation();

// Titre de la collection
<Title content={t('collection.pages.title')} />

// Bouton d'ajout
<Button title={t('collection.actions.add')} />

// Message de toast
showSuccessToast(
  t('collection.messages.deleted.title'),
  t('collection.messages.deleted.description')
);

// Erreur de formulaire
setErrorMsg(t('collection.modal.form.errors.sku.required'));
```

## ✅ Avantages de la nouvelle structure

1. **Organisation logique** : Les clés sont groupées par domaine fonctionnel
2. **Maintenance simplifiée** : Plus facile de trouver et modifier les traductions
3. **Évolutivité** : Ajout de nouvelles fonctionnalités plus simple
4. **Cohérence** : Structure uniforme entre toutes les langues
5. **Performance** : Imports optimisés et organisation claire

## 🔍 Comment migrer vos composants

1. **Identifiez le domaine** : Collection, Social, Navigation, UI, etc.
2. **Utilisez le mapping** ci-dessus pour trouver la nouvelle clé
3. **Testez** avec les différentes langues
4. **Vérifiez** que tous les textes s'affichent correctement

## 📝 Notes importantes

-   Les fichiers `auth.json`, `alert.json` et `settings.json` restent inchangés
-   L'ancien fichier `common.json` a été supprimé
-   Toutes les nouvelles clés suivent la convention `domaine.type.nom`
-   Les traductions restent compatibles avec `useTranslation()` de react-i18next

## 🆘 Support

Si vous rencontrez des problèmes lors de la migration :

1. Vérifiez que la clé existe dans les deux langues (EN/FR)
2. Consultez ce guide de mapping
3. Testez l'affichage dans les deux langues
4. Redémarrez le serveur de développement si nécessaire
