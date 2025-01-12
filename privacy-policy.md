# Politique de confidentialité de KicksFolio

Last update : 05/01/2025

## 1. Collecte des données
KicksFolio collects the following data:
- Email: for authentication and account management
- Photo library: to allow you to select and add photos of your sneakers to your collection 
- Camera access: to allow you to take photos of your sneakers directly from the app
- Biometric data (Face ID): to secure access to your account

## 2. Utilisation des données
These data are used for :
- User authentication
- Sneakers collection management
- Sneakers photos taking
- Application access security

## 3. Storage and security
The data are stored securely via :

- SecureStore from Expo for mobile devices :
  - The authentication token
  - User information
  - Collection data
  - Sneakers data

- LocalStorage for the web version :
  - Temporary storage of session data
  - Client-side encrypted data

The data security is ensured by :
- Native encrypted storage on iOS and Android
- Authentication with JWT token
- Automatic token validity check
- Automatic data cleaning when logging out
- Secure synchronization with the backend
- Access protection

Data retention :
- The data are kept as long as the user is active
- Automatic deletion when logging out
- The user can request the deletion of their data at any time

Data protection :
- Passwords are never stored locally
- Biometric data is handled by the native system
- Permissions (camera, photos) are explicitly requested
- Navigation data is temporary

Data transfer :
- Secure communication with the backend via HTTPS
- No data transfer to third parties
- Data hosting in France
- RGPD compliance

