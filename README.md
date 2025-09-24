# KicksFolio

A comprehensive mobile application for sneaker enthusiasts to manage, track, and showcase their sneaker collections. Built with React Native and Expo, KicksFolio provides a modern, intuitive platform for sneaker collectors to organize their collections, connect with other enthusiasts, and discover new releases.

## 🏗️ Architecture Overview

KicksFolio follows **Clean Architecture** principles with **SOLID** design patterns, ensuring maintainable, scalable, and testable code. The application is structured in distinct layers that promote separation of concerns and dependency inversion.

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │    Screens      │  │   Components    │  │   Contexts  │ │
│  │   (Pages)       │  │     (UI)        │  │   (State)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │     Hooks       │  │     Stores      │  │ Validation  │ │
│  │  (Use Cases)    │  │   (Zustand)     │  │   (Zod)     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                     Domain Layer                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Interfaces    │  │   Entities      │  │    Types    │ │
│  │  (Contracts)    │  │ (Business Logic)│  │ (Definitions)│ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │     Proxies     │  │     Config      │  │   Services  │ │
│  │(Implementation) │  │   (Supabase)    │  │   (Local)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Architecture Patterns

- **Dependency Inversion Principle**: Domain interfaces define contracts, infrastructure proxies implement them
- **Proxy Pattern**: Infrastructure proxies handle external dependencies (Supabase, APIs) and implement domain interfaces
- **Clean Architecture**: Strict separation between domain logic and infrastructure concerns
- **Promise-based Error Handling**: Consistent `.then()/.catch()` pattern throughout domain layer
- **Repository Pattern**: Data access abstraction through domain interfaces
- **Observer Pattern**: State management with Zustand stores and React Context
- **Command Pattern**: Modal actions and form submissions

### Architecture Implementation

#### Domain Layer
The domain layer contains pure business logic and defines contracts through interfaces. Each domain class encapsulates business logic and uses the `.then()/.catch()` pattern for consistent error handling:

```typescript
// Domain interface defining the contract
export interface AuthProviderInterface {
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

// Domain class encapsulating business logic
export class Auth {
  constructor(private readonly authProvider: AuthProviderInterface) {}

  signIn = async (email: string, password: string) => {
    return this.authProvider
      .signIn(email, password)
      .then((response) => response.user)
      .catch((error) => {
        console.error('❌ Auth.signIn: Error occurred:', error);
        throw error;
      });
  };
}
```

#### Infrastructure Layer (Tech/Proxy)
The infrastructure layer implements domain interfaces and handles external dependencies (APIs, databases, services):

```typescript
export class AuthProxy implements AuthProviderInterface {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}
```

#### Dependency Injection
Application hooks inject concrete implementations into domain classes:

```typescript
const useAuth = () => {
  const authProxy = new AuthProxy();
  const auth = new Auth(authProxy);
  
  return {
    signIn: auth.signIn,
    signOut: auth.signOut,
  };
};
```

This approach ensures:
- **Testability**: Facilitates dependency mocking
- **Maintainability**: Clear separation of responsibilities
- **Extensibility**: Easy addition of new implementations
- **Robustness**: Centralized and consistent error handling

## 🚀 Features

### Core Functionality

#### 📱 **Collection Management**
- **Add Sneakers**: Multiple input methods including SKU lookup, barcode scanning, and manual entry
- **Edit & Update**: Comprehensive editing capabilities with real-time validation
- **Image Management**: Multi-image upload with cropping and optimization via Photo Carousel
- **Size Conversion**: Automatic conversion between US and EU sizing systems
- **Condition Tracking**: 10-point condition scale with visual indicators
- **Status Management**: Track sneakers as "Rocking", "Stocking", or "Selling"
- **Advanced Display Modes**: Card view, list view, and hybrid card display with chunked data loading
- **Performance Optimization**: Chunked rendering for large collections (1000+ items)

#### 🔍 **Discovery & Search**
- **User Search**: Find other collectors by username or name
- **SKU Lookup**: External API integration for sneaker data retrieval
- **Barcode Scanner**: Camera-based barcode scanning for quick entry
- **Advanced Filtering**: Filter by brand, size, condition, and status with real-time updates
- **Search Results**: Paginated and optimized user search with follow/unfollow actions

#### 👥 **Social Features**
- **Follow System**: Follow other collectors and view their collections with real-time notifications
- **Profile Management**: Customizable profiles with social media integration
- **Collection Sharing**: Generate shareable collection links with custom filters
- **Activity Feed**: View collections from followed users with chunked loading
- **Push Notifications**: Real-time notifications for new followers and collection updates

#### ❤️ **Wishlist Management**
- **Add to Wishlist**: Mark desired sneakers for future purchase
- **Wishlist Tracking**: Separate view for wishlist items with swipe actions
- **Wishlist Integration**: Seamless conversion between collection and wishlist items

#### ⚙️ **Settings & Customization**
- **Multi-language Support**: English and French localization with i18next
- **Currency Settings**: Multiple currency display options
- **Size Unit Preferences**: Toggle between US and EU sizing
- **Theme Support**: Automatic light/dark mode detection
- **Privacy Controls**: Manage profile and collection visibility
- **Notification Settings**: Granular control over push notifications and followers notifications

### Advanced Features

#### 🔐 **Authentication & Security**
- **Secure Authentication**: JWT-based authentication with Supabase and Row Level Security
- **Password Reset**: Email-based password recovery with deep linking
- **Session Management**: Automatic token refresh and session persistence
- **Anonymous Sharing**: Secure collection sharing without authentication requirements
- **Account Management**: Complete account deletion with data cleanup

#### 📊 **Data Management & Performance**
- **Chunked Data Loading**: Intelligent data chunking for large collections (threshold: 50+ items)
- **Memory Optimization**: Automatic chunk cleanup and memory management
- **Data Validation**: Comprehensive form validation with Zod schemas
- **Image Optimization**: Automatic image compression and resizing with Expo Image
- **Local Storage**: AsyncStorage integration for offline data persistence
- **Real-time Sync**: Live data updates via Supabase real-time subscriptions

#### 📱 **Push Notifications System**
- **Expo Notifications**: Native push notification integration
- **Smart Notifications**: Contextual notifications for followers and collection updates
- **Notification Settings**: Granular user control over notification preferences
- **Background Sync**: Automatic notification polling and updates

#### 🌐 **Internationalization**
- **i18n Support**: Complete internationalization with react-i18next
- **Dynamic Language Switching**: Runtime language changes
- **Localized Content**: Region-specific formatting and content

## 🛠️ Technical Stack

### Frontend Framework
- **React Native**: Cross-platform mobile development
- **Expo SDK**: Development platform and tools
- **TypeScript**: Type-safe JavaScript development
- **Expo Router**: File-based navigation system

### UI & Styling
- **NativeWind**: Tailwind CSS for React Native
- **React Native Reanimated**: Smooth animations and gestures
- **Expo Vector Icons**: Comprehensive icon library
- **Custom Components**: Reusable UI component library

### State Management
- **Zustand**: Lightweight state management
- **React Context**: Global application state
- **React Hook Form**: Form state and validation
- **Async Storage**: Persistent local storage

### Backend & Database
- **Supabase**: Backend-as-a-Service platform
- **PostgreSQL**: Relational database with real-time subscriptions
- **Row Level Security**: Database-level security policies
- **Edge Functions**: Serverless API endpoints

### Development Tools
- **ESLint & Prettier**: Code formatting and linting
- **Husky**: Git hooks for code quality
- **Commitizen**: Conventional commit messages
- **Madge**: Circular dependency detection

### Testing Framework
- **Jest**: Component and integration testing with React Native Testing Library
- **Vitest**: Unit testing for business logic, hooks, and domain layer
- **Interface Testing**: Contract testing for domain interfaces
- **Coverage Reports**: Comprehensive test coverage analysis across all layers

### Build & Deployment
- **EAS Build**: Expo Application Services
- **EAS Submit**: App store deployment
- **Environment Management**: Multiple build profiles
- **CI/CD**: Automated testing and deployment

## 📁 Project Structure

```
KicksFolio/
├── src/
│   ├── app/                    # Expo Router pages
│   │   ├── (auth)/            # Authentication screens
│   │   │   ├── (signup)/      # Multi-step signup flow
│   │   │   ├── login.tsx      # Login screen
│   │   │   ├── forgot-password.tsx # Password recovery
│   │   │   └── reset-password.tsx  # Password reset
│   │   ├── (app)/             # Main application screens
│   │   │   ├── (tabs)/        # Bottom tab navigation
│   │   │   │   ├── index.tsx  # Home/Collection screen
│   │   │   │   ├── add.tsx    # Add sneakers screen
│   │   │   │   ├── profile.tsx # User profile
│   │   │   │   ├── search/    # User search & discovery
│   │   │   │   └── wishlist.tsx # Wishlist management
│   │   │   ├── settings.tsx   # App settings
│   │   │   ├── edit-profile.tsx # Profile editing
│   │   │   └── social-media.tsx # Social media integration
│   │   ├── share-collection/  # Anonymous collection sharing
│   │   └── _layout.tsx        # Root layout with auth handling
│   │
│   ├── components/            # Reusable UI components
│   │   ├── screens/           # Screen-specific components
│   │   │   ├── app/           # Main app screen components
│   │   │   │   ├── profile/   # Profile display components
│   │   │   │   │   ├── displayState/ # Collection display modes
│   │   │   │   │   │   ├── card/  # Card view components
│   │   │   │   │   │   └── list/  # List view components
│   │   │   │   │   └── hooks/  # Profile-specific hooks
│   │   │   │   ├── search/    # User search components
│   │   │   │   ├── settings/  # Settings screen components
│   │   │   │   │   ├── accountSettings/ # Account management
│   │   │   │   │   ├── appSettings/     # App preferences
│   │   │   │   │   └── notificationSettings/ # Push notification settings
│   │   │   │   └── wishlist/  # Wishlist components with swipe actions
│   │   │   ├── auth/          # Authentication screen components
│   │   │   └── share-collection/ # Anonymous sharing components
│   │   └── ui/                # Generic UI components
│   │       ├── buttons/       # Button components
│   │       ├── cards/         # Card components
│   │       ├── inputs/        # Form input components
│   │       ├── modals/        # Modal components
│   │       │   ├── SneakersModal/ # Multi-step sneaker modal
│   │       │   └── BugReportModal/ # Bug reporting
│   │       ├── images/        # Image components
│   │       │   └── photoCaroussel/ # Photo carousel with crop
│   │       └── text/          # Text components
│   │
│   ├── contexts/              # React Context providers
│   │   └── authContext.tsx    # Authentication & user state context
│   │
│   ├── domain/                # Domain layer - Business logic and contracts
│   │   ├── Auth.ts            # Authentication domain logic
│   │   ├── AuthValidator.ts   # Authentication validation logic
│   │   ├── ChunkProviderInterface.ts # Data chunking for performance
│   │   ├── FollowerHandler.ts # Social following with notifications
│   │   ├── GitHubIssueHandler.ts # Bug reporting logic
│   │   ├── ImageStorage.ts    # Image management logic
│   │   ├── NotificationHandler.ts # Push notifications management
│   │   ├── ShareHandler.ts    # Collection sharing logic
│   │   ├── SneakerHandler.ts  # Sneaker CRUD operations
│   │   ├── SneakerImageHandler.ts # Sneaker image processing
│   │   ├── UserLookup.ts      # User search logic
│   │   └── Wishlist.ts        # Wishlist management logic
│   │
│   ├── tech/                  # Infrastructure layer
│   │   └── proxy/             # Implementation proxies
│   │       ├── AuthProxy.ts   # Supabase authentication implementation
│   │       ├── ChunkProxy.ts  # Data chunking implementation
│   │       ├── FollowerProxy.ts # Social features with RLS
│   │       ├── NotificationProxy.ts # Push notification integration
│   │       ├── ShareProxy.ts  # Collection sharing implementation
│   │       ├── SneakerProxy.ts # Sneaker database operations
│   │       ├── UserLookupProxy.ts # User search implementation
│   │       └── WishlistProxy.ts # Wishlist database operations
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── form/              # Form-related hooks
│   │   │   ├── useFormController.ts # Form state management
│   │   │   └── useInputSubmit.ts    # Input submission handling
│   │   ├── ui/                # UI interaction hooks
│   │   │   ├── useAnimatedButtons.ts # Button animations
│   │   │   └── useToast.ts          # Toast notifications
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useNotifications.ts # Push notifications management
│   │   ├── useNotificationSettings.ts # Notification preferences
│   │   ├── useShareCollection.ts # Collection sharing hook
│   │   ├── useImageManager.ts # Image handling hook
│   │   ├── usePushNotifications.ts # Push notification registration
│   │   └── useUserProfile.ts  # User profile hook
│   │
│   ├── store/                 # Zustand state stores
│   │   ├── useCurrencyStore.ts    # Currency preferences
│   │   ├── useModalStore.ts       # Modal state management
│   │   ├── useSneakerFilterStore.ts # Collection filtering
│   │   └── useUserSearchStore.ts   # User search state
│   │
│   ├── types/                 # TypeScript type definitions
│   │   ├── auth.ts            # Authentication types
│   │   ├── database.ts        # Database schema types
│   │   ├── filter.ts          # Filtering types
│   │   ├── notification.ts    # Push notification types
│   │   ├── sharing.ts         # Collection sharing types
│   │   ├── sneaker.ts         # Sneaker entity types
│   │   └── user.ts            # User entity types
│   │
│   ├── validation/            # Data validation schemas
│   │   ├── auth.ts            # Authentication validation
│   │   ├── sneaker.ts         # Sneaker validation
│   │   └── schemas.ts         # Zod schemas
│   │
│   ├── locales/               # Internationalization
│   │   ├── en/                # English translations
│   │   ├── fr/                # French translations
│   │   └── i18n.ts            # i18n configuration
│   │
│   ├── config/                # Configuration files
│   │   └── supabase/          # Supabase configuration
│   │
│   └── assets/                # Static assets
│       ├── fonts/             # Custom fonts (Actonia, Syne, OpenSans)
│       └── images/            # Image assets
│
├── __tests__/                 # Test files
│   ├── components/            # Component tests
│   ├── hooks/                 # Hook tests
│   ├── interfaces/            # Interface tests
│   └── setup/                 # Test configuration
│
├── docs/                      # Documentation
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── vitest.config.ts           # Vitest configuration
└── README.md                  # Project documentation
```

## 🗄️ Database Schema

The application uses a PostgreSQL database with the following main entities:

### Users Table
```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email varchar NOT NULL UNIQUE,
  username varchar NOT NULL UNIQUE,
  sneaker_size numeric NOT NULL CHECK (sneaker_size >= 7 AND sneaker_size <= 48),
  profile_picture varchar,
  instagram_username varchar,
  social_media_visibility boolean DEFAULT true,
  password_hash varchar,
  reset_password_token varchar UNIQUE,
  reset_password_sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  following_additions_enabled boolean DEFAULT true,
  new_followers_enabled boolean NOT NULL DEFAULT true
);
```

### Sneakers Table
```sql
CREATE TABLE public.sneakers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  brand varchar NOT NULL,
  model varchar NOT NULL,
  sku varchar,
  size_eu numeric NOT NULL CHECK (size_eu >= 35 AND size_eu <= 50),
  size_us numeric NOT NULL CHECK (size_us >= 3 AND size_us <= 17),
  gender text NOT NULL CHECK (gender IN ('men', 'women')),
  condition integer NOT NULL CHECK (condition >= 1 AND condition <= 10),
  status varchar NOT NULL DEFAULT 'rocking',
  price_paid numeric,
  estimated_value numeric,
  description text,
  images ARRAY NOT NULL,
  og_box boolean,
  ds boolean,
  wishlist boolean NOT NULL DEFAULT false,
  purchase_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Followers Table
```sql
CREATE TABLE public.followers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id uuid NOT NULL REFERENCES users(id),
  following_id uuid NOT NULL REFERENCES users(id),
  created_at timestamp with time zone DEFAULT now()
);
```

### Notifications Table
```sql
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id uuid NOT NULL REFERENCES users(id),
  type varchar NOT NULL,
  data jsonb NOT NULL,
  title varchar NOT NULL,
  body varchar NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Push Tokens Table
```sql
CREATE TABLE public.push_tokens (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  expo_token varchar NOT NULL UNIQUE,
  device_id varchar,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);
```

### Shared Collections Table
```sql
CREATE TABLE public.shared_collections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id),
  share_token varchar NOT NULL UNIQUE,
  filters jsonb NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/your-username/kicksfolio.git
cd kicksfolio
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Start the development server**
```bash
npm start
```

### Development Commands

- `npm start` - Start Expo development server
- `npm run test` - Run all tests (Jest + Vitest)
- `npm run test:jest` - Run component tests
- `npm run test:vitest` - Run unit tests
- `npm run test:interfaces` - Run interface contract tests
- `npm run test:hooks` - Run hook tests
- `npm run test:coverage` - Generate test coverage reports
- `npm run format` - Format code with Prettier
- `npm run build:ios` - Build for iOS (production)
- `npm run build:android` - Build for Android (production)
- `npm run build:all:dev` - Build development versions for all platforms
- `npm run madge` - Check for circular dependencies

## 🧪 Testing Strategy

The application employs a comprehensive testing strategy covering multiple layers:

### Testing Framework Configuration

#### Jest (Component Testing)
- **Target**: React Native components and screens
- **Setup**: `jest-expo` preset with React Native Testing Library
- **Coverage**: UI components, user interactions, navigation

#### Vitest (Business Logic Testing)
- **Target**: Hooks, interfaces, domain logic, stores
- **Setup**: JSDOM environment with React testing utilities
- **Coverage**: Business logic, data transformations, state management

### Test Categories

1. **Unit Tests**: Individual functions and utilities
2. **Integration Tests**: Component interactions and data flow
3. **Interface Tests**: Contract testing for domain interfaces
4. **Hook Tests**: Custom React hooks behavior
5. **Store Tests**: State management logic

### Test Structure
```
src/__tests__/
├── components/         # Component integration tests
├── hooks/             # Custom hook tests
├── interfaces/        # Interface contract tests
├── domain/            # Business logic tests
├── store/             # State management tests
└── setup/             # Test configuration
```

## 🔐 Security Features

### Authentication Security
- JWT token-based authentication
- Automatic token refresh
- Secure token storage with Expo SecureStore
- Session timeout and cleanup

### Data Protection
- Row Level Security (RLS) in Supabase
- Input validation and sanitization
- Image upload security with file type validation
- API rate limiting and abuse prevention

### Privacy Controls
- User profile visibility settings
- Social media integration controls
- Data deletion and export capabilities
- GDPR compliance features

## 🌍 Internationalization

The application supports multiple languages with complete localization:

### Supported Languages
- **English** (default)
- **French**

### Translation Structure
```
src/locales/
├── en/
│   ├── auth.json          # Authentication texts
│   ├── collection.json    # Collection management
│   ├── navigation.json    # Navigation labels
│   ├── settings.json      # Settings screens
│   └── ui.json           # UI components
└── fr/
    ├── auth.json
    ├── collection.json
    ├── navigation.json
    ├── settings.json
    └── ui.json
```

### Usage Example
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <Text>{t('auth.login.title')}</Text>
  );
};
```

## 📱 Platform Support

### iOS
- **Minimum Version**: iOS 13.0
- **Target**: iPhone and iPod touch
- **Features**: Native camera integration, biometric authentication
- **App Store**: Ready for submission

### Android
- **Minimum Version**: Android 6.0 (API level 23)
- **Target**: Phone and tablet devices
- **Features**: Camera integration, fingerprint authentication
- **Google Play**: Ready for submission

### Web (Experimental)
- **Support**: Basic web functionality
- **Limitations**: Camera and native features not available
- **Use Case**: Development and testing

## 🔄 State Management

### Architecture Overview

The application uses a hybrid state management approach:

#### Global State (Zustand)
- **Modal State**: Modal visibility and navigation
- **User Preferences**: Settings, language, currency
- **Filter State**: Search and collection filters
- **UI State**: Loading states, error handling

#### Context State (React Context)
- **Authentication**: User session and authentication state
- **User Data**: Profile information and collections
- **Navigation**: Deep linking and route management

#### Local State (React Hooks)
- **Form State**: Form inputs and validation
- **Component State**: UI interactions and animations
- **Temporary State**: Search results, modal data

### State Flow Example

```typescript
// Global store for modal management
const useModalStore = create<ModalStore>((set) => ({
  isVisible: false,
  modalStep: 'index',
  setIsVisible: (visible) => set({ isVisible: visible }),
  setModalStep: (step) => set({ modalStep: step }),
}));

// Context for authentication
const AuthContext = createContext<AuthContextType>({});

// Local form state
const useFormController = <T>(config: FormConfig<T>) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  // ... form logic
};
```

## 🎨 Design System

### Color Palette
- **Primary**: `#F27329` (Orange)
- **Background**: `#ECECEC` (Light Gray)
- **Text**: Dynamic based on theme
- **Accent**: Gradient combinations

### Typography
- **Actonia**: Display and heading text
- **Syne**: Secondary headings
- **OpenSans**: Body text and UI elements

### Component Library
- **Buttons**: Primary, secondary, icon buttons
- **Cards**: Collection cards, user cards
- **Inputs**: Text, select, image inputs
- **Modals**: Full-screen and bottom sheet modals
- **Navigation**: Tab bar, stack navigation

## 📄 License

This project is licensed under the AGPL-3.0 - see the [LICENSE](LICENSE) file for details.

### Code Standards
- Follow TypeScript best practices
- Use conventional commit messages
- Follow the established architecture patterns

## 📞 Support

For support, bug reports, or feature requests:
- **Issues**: GitHub Issues
- **Email**: contact@kicksfolio.com

---

**KicksFolio** - Flex Smarter. Collect Better.
