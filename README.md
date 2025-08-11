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
│  │   Providers     │  │   Interfaces    │  │    Types    │ │
│  │ (Business Logic)│  │  (Contracts)    │  │  (Entities) │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                               │
┌─────────────────────────────────────────────────────────────┐
│                 Infrastructure Layer                        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │    Services     │  │     Config      │  │   Storage   │ │
│  │ (External APIs) │  │   (Supabase)    │  │   (Local)   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Key Architecture Patterns

- **Dependency Injection**: Interfaces define contracts, providers implement business logic
- **Repository Pattern**: Data access abstraction through provider interfaces
- **Observer Pattern**: State management with Zustand stores and React Context
- **Command Pattern**: Modal actions and form submissions
- **Strategy Pattern**: Different authentication and data validation strategies

## 🚀 Features

### Core Functionality

#### 📱 **Collection Management**
- **Add Sneakers**: Multiple input methods including SKU lookup, barcode scanning, and manual entry
- **Edit & Update**: Comprehensive editing capabilities with real-time validation
- **Image Management**: Multi-image upload with cropping and optimization
- **Size Conversion**: Automatic conversion between US and EU sizing systems
- **Condition Tracking**: 10-point condition scale with visual indicators
- **Status Management**: Track sneakers as "Rocking", "Stocking", or "Selling"

#### 🔍 **Discovery & Search**
- **User Search**: Find other collectors by username or name
- **SKU Lookup**: External API integration for sneaker data retrieval
- **Barcode Scanner**: Camera-based barcode scanning for quick entry
- **Advanced Filtering**: Filter by brand, size, condition, and status

#### 👥 **Social Features**
- **Follow System**: Follow other collectors and view their collections
- **Profile Management**: Customizable profiles with social media integration
- **Collection Sharing**: Showcase collections with privacy controls
- **Activity Feed**: View collections from followed users

#### ❤️ **Wishlist Management**
- **Add to Wishlist**: Mark desired sneakers for future purchase
- **Wishlist Tracking**: Separate view for wishlist items
- **Price Monitoring**: Track estimated values and price changes

#### ⚙️ **Settings & Customization**
- **Multi-language Support**: English and French localization
- **Currency Settings**: Multiple currency display options
- **Size Unit Preferences**: Toggle between US and EU sizing
- **Theme Support**: Automatic light/dark mode detection
- **Privacy Controls**: Manage profile and collection visibility

### Advanced Features

#### 🔐 **Authentication & Security**
- **Secure Authentication**: JWT-based authentication with Supabase
- **Password Reset**: Email-based password recovery with deep linking
- **Session Management**: Automatic token refresh and session persistence
- **Biometric Support**: Device-native biometric authentication

#### 📊 **Data Management**
- **Offline Support**: Local storage with sync capabilities
- **Data Validation**: Comprehensive form validation with Zod schemas
- **Image Optimization**: Automatic image compression and resizing
- **Backup & Sync**: Cloud synchronization with conflict resolution

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
- **Jest**: Component and integration testing
- **Vitest**: Unit testing for business logic
- **React Native Testing Library**: Component testing utilities
- **Coverage Reports**: Comprehensive test coverage analysis

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
│   │   ├── (app)/             # Main application screens
│   │   │   ├── (tabs)/        # Bottom tab navigation
│   │   │   └── settings/      # Settings screens
│   │   └── _layout.tsx        # Root layout
│   │
│   ├── components/            # Reusable UI components
│   │   ├── screens/           # Screen-specific components
│   │   └── ui/                # Generic UI components
│   │       ├── buttons/       # Button components
│   │       ├── cards/         # Card components
│   │       ├── inputs/        # Input components
│   │       ├── modals/        # Modal components
│   │       └── text/          # Text components
│   │
│   ├── contexts/              # React Context providers
│   │   ├── authContext.tsx    # Authentication context
│   │   └── signUpPropsContext.tsx
│   │
│   ├── domain/                # Business logic layer
│   │   ├── AuthProxy.ts    # Authentication business logic
│   │   ├── SneakerProxy.ts # Sneaker management logic
│   │   ├── UserSearchProvider.ts
│   │   └── WishlistProvider.ts
│   │
│   ├── interfaces/            # Domain contracts
│   │   ├── Auth.ts   # Authentication interface
│   │   ├── SneakerHandler.ts
│   │   └── UserSearchInterface.ts
│   │
│   ├── hooks/                 # Custom React hooks
│   │   ├── form/              # Form-related hooks
│   │   ├── ui/                # UI interaction hooks
│   │   ├── useAuth.ts         # Authentication hook
│   │   ├── useImageManager.ts # Image handling hook
│   │   └── useUserProfile.ts  # User profile hook
│   │
│   ├── services/              # External service integrations
│   │   ├── ImageService.ts    # Image processing service
│   │   └── StorageService.ts  # Local storage service
│   │
│   ├── store/                 # Zustand state stores
│   │   ├── useCurrencyStore.ts
│   │   ├── useModalStore.ts
│   │   ├── useSneakerFilterStore.ts
│   │   └── useUserSearchStore.ts
│   │
│   ├── types/                 # TypeScript type definitions
│   │   ├── auth.ts            # Authentication types
│   │   ├── sneaker.ts         # Sneaker entity types
│   │   ├── user.ts            # User entity types
│   │   └── image.ts           # Image types
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
│       ├── fonts/             # Custom fonts
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
  first_name varchar NOT NULL,
  last_name varchar NOT NULL,
  sneaker_size numeric NOT NULL CHECK (sneaker_size >= 7 AND sneaker_size <= 48),
  profile_picture varchar,
  instagram_username varchar,
  social_media_visibility boolean DEFAULT true,
  password_hash varchar,
  reset_password_token varchar UNIQUE,
  reset_password_sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
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

### Wishlists Table
```sql
CREATE TABLE public.wishlists (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  sneaker_id uuid REFERENCES sneakers(id),
  created_at timestamp without time zone DEFAULT now()
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
- `npm run test` - Run all tests
- `npm run test:jest` - Run component tests
- `npm run test:vitest` - Run unit tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run build:ios` - Build for iOS
- `npm run build:android` - Build for Android

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

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Follow the established architecture patterns

## 📞 Support

For support, bug reports, or feature requests:
- **Issues**: GitHub Issues
- **Documentation**: [Project Wiki](docs/)
- **Email**: support@kicksfolio.app

---

**KicksFolio** - Manage your sneaker collection with style and precision.