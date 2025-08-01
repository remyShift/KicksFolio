import { cleanup, fireEvent } from '@testing-library/react-native';
import { act } from 'react';
import '@testing-library/react-native/extend-expect';
import { ReactTestInstance } from 'react-test-renderer';
import {
	mockUseAuth,
	mockUseSignUpProps,
	mockUser,
	mockUseAsyncValidation,
	mockAuthInterface,
	mockAuthProviderImpl,
} from './screens/auth/authSetup';

jest.mock('@react-native-async-storage/async-storage', () => ({
	__esModule: true,
	default: {
		getItem: jest.fn(),
		setItem: jest.fn(),
		removeItem: jest.fn(),
		clear: jest.fn(),
	},
}));

jest.mock('../store/useSizeUnitStore', () => ({
	useSizeUnitStore: Object.assign(
		() => ({
			currentUnit: 'US',
			isInitialized: true,
			setUnit: jest.fn(),
			initializeUnit: jest.fn().mockResolvedValue(undefined),
			getCurrentUnit: jest.fn().mockReturnValue('US'),
		}),
		{
			getState: () => ({
				currentUnit: 'US',
				isInitialized: true,
				setUnit: jest.fn(),
				initializeUnit: jest.fn().mockResolvedValue(undefined),
				getCurrentUnit: jest.fn().mockReturnValue('US'),
			}),
			subscribe: jest.fn().mockReturnValue(() => {}),
		}
	),
}));

jest.mock('expo-secure-store', () => ({
	getItemAsync: jest.fn(),
	setItemAsync: jest.fn(),
	deleteItemAsync: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => {
	const { Text } = require('react-native');
	return {
		Ionicons: Text,
		FontAwesome: Text,
		FontAwesome6: Text,
		MaterialIcons: Text,
		AntDesign: Text,
		Entypo: Text,
		EvilIcons: Text,
		Feather: Text,
		FontAwesome5: Text,
		Foundation: Text,
		MaterialCommunityIcons: Text,
		Octicons: Text,
		SimpleLineIcons: Text,
		Zocial: Text,
	};
});

jest.mock('../domain/AuthProviderImpl', () => ({
	authProvider: mockAuthProviderImpl,
}));

jest.mock('../hooks/useAuth', () => ({
	useAuth: jest.fn().mockReturnValue(mockUseAuth),
}));

jest.mock('../interfaces/AuthInterface', () => ({
	AuthInterface: mockAuthInterface,
}));

jest.mock('../context/signUpPropsContext', () => ({
	useSignUpProps: () => mockUseSignUpProps,
}));

jest.mock('../hooks/useAsyncValidation', () => ({
	useAsyncValidation: () => mockUseAsyncValidation,
}));

jest.mock('../hooks/useToast', () => ({
	__esModule: true,
	default: jest.fn(() => ({
		showSuccessToast: jest.fn(),
		showErrorToast: jest.fn(),
		showInfoToast: jest.fn(),
	})),
	useToast: () => ({
		showSuccessToast: jest.fn(),
		showErrorToast: jest.fn(),
		showInfoToast: jest.fn(),
	}),
}));

jest.mock('../context/authContext', () => ({
	useSession: jest.fn().mockReturnValue({
		user: mockUser,
		isLoading: false,
		userSneakers: [],
		setUserSneakers: jest.fn(),
		setUser: jest.fn(),
		refreshUserData: jest.fn(),
		refreshUserSneakers: jest.fn(),
	}),
}));

jest.mock('expo-font', () => ({
	loadAsync: jest.fn().mockResolvedValue(undefined),
	isLoaded: jest.fn().mockReturnValue(true),
	useFonts: () => [true, null],
	unloadAsync: jest.fn(),
	loadedNativeFonts: [],
}));

jest.mock('expo-router', () => ({
	Link: ({ children }: { children: React.ReactNode }) => children,
	useLocalSearchParams: jest.fn().mockReturnValue({ newUser: 'true' }),
	router: {
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
	},
}));

jest.mock('../store/useModalStore', () => ({
	useModalStore: () => ({
		modalStep: 'index',
		isVisible: false,
		currentSneaker: null,
		sneakerSKU: '',
		fetchedSneaker: null,
		sneakerToAdd: null,
		errorMsg: '',
		validateForm: null,
		clearFormErrors: null,
		estimatedValue: 0,
		setModalStep: jest.fn(),
		setIsVisible: jest.fn(),
		setCurrentSneaker: jest.fn(),
		setSneakerSKU: jest.fn(),
		setFetchedSneaker: jest.fn(),
		setSneakerToAdd: jest.fn(),
		setErrorMsg: jest.fn(),
		setValidateForm: jest.fn(),
		setClearFormErrors: jest.fn(),
		resetModalData: jest.fn(),
		setEstimatedValue: jest.fn(),
		setGender: jest.fn(),
		setSku: jest.fn(),
		resetModal: jest.fn(),
	}),
}));

jest.mock('../config/supabase/supabase.config', () => ({
	SUPABASE_CONFIG: {
		url: 'http://toto.com',
		anonKey: 'test',
		options: {
			auth: {
				autoRefreshToken: true,
				persistSession: true,
				detectSessionInUrl: false,
			},
		},
	},

	validateSupabaseConfig: jest.fn().mockReturnValue(true),
}));

jest.mock('react-native-keyboard-controller', () => {
	const { ScrollView } = require('react-native');
	return {
		KeyboardAwareScrollView: ScrollView,
		KeyboardProvider: ({ children }: { children: React.ReactNode }) =>
			children,
		KeyboardController: {
			setInputMode: jest.fn(),
			setDefaultMode: jest.fn(),
		},
	};
});

jest.mock('react-native-image-crop-picker', () => ({
	openPicker: jest.fn().mockResolvedValue({
		path: 'mocked-image-path',
		mime: 'image/jpeg',
		size: 1024,
		width: 500,
		height: 500,
	}),
	openCamera: jest.fn().mockResolvedValue({
		path: 'mocked-camera-path',
		mime: 'image/jpeg',
		size: 1024,
		width: 500,
		height: 500,
	}),
	openCropper: jest.fn(),
	clean: jest.fn(),
	cleanSingle: jest.fn(),
}));

jest.mock('react-native-gesture-handler', () => {
	const { View, ScrollView } = require('react-native');

	const createMockGesture = () => ({
		onBegin: jest.fn().mockReturnThis(),
		onFinalize: jest.fn().mockReturnThis(),
		onEnd: jest.fn().mockReturnThis(),
		onStart: jest.fn().mockReturnThis(),
		onUpdate: jest.fn().mockReturnThis(),
		onCancel: jest.fn().mockReturnThis(),
		onFail: jest.fn().mockReturnThis(),
		onTouchesDown: jest.fn().mockReturnThis(),
		onTouchesMove: jest.fn().mockReturnThis(),
		onTouchesUp: jest.fn().mockReturnThis(),
		onTouchesCancelled: jest.fn().mockReturnThis(),
		enabled: jest.fn().mockReturnThis(),
		shouldCancelWhenOutside: jest.fn().mockReturnThis(),
		hitSlop: jest.fn().mockReturnThis(),
		runOnJS: jest.fn().mockReturnThis(),
		simultaneousWithExternalGesture: jest.fn().mockReturnThis(),
		requireExternalGestureToFail: jest.fn().mockReturnThis(),
		blocksExternalGesture: jest.fn().mockReturnThis(),
	});

	return {
		GestureHandlerRootView: View,
		PanGestureHandler: View,
		TapGestureHandler: View,
		LongPressGestureHandler: View,
		PinchGestureHandler: View,
		RotationGestureHandler: View,
		FlingGestureHandler: View,
		ForceTouchGestureHandler: View,
		NativeViewGestureHandler: View,
		createNativeWrapper: jest.fn(),
		ScrollView: ScrollView,
		Swipeable: View,
		DrawerLayout: View,
		State: {
			UNDETERMINED: 0,
			FAILED: 1,
			BEGAN: 2,
			CANCELLED: 3,
			ACTIVE: 4,
			END: 5,
		},
		Directions: {
			RIGHT: 1,
			LEFT: 2,
			UP: 4,
			DOWN: 8,
		},
		gestureHandlerRootHOC: jest
			.fn()
			.mockImplementation((component) => component),
		Gesture: {
			Tap: () => createMockGesture(),
			Pan: () => createMockGesture(),
			Pinch: () => createMockGesture(),
			Rotation: () => createMockGesture(),
			Fling: () => createMockGesture(),
			LongPress: () => createMockGesture(),
			ForceTouch: () => createMockGesture(),
		},
		GestureDetector: View,
	};
});

jest.mock('@supabase/supabase-js', () => ({
	createClient: jest.fn().mockReturnValue({
		auth: {
			signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
			signInWithPassword: jest
				.fn()
				.mockResolvedValue({ data: null, error: null }),
			signOut: jest.fn().mockResolvedValue({ error: null }),
			resetPasswordForEmail: jest
				.fn()
				.mockResolvedValue({ data: null, error: null }),
			updateUser: jest
				.fn()
				.mockResolvedValue({ data: null, error: null }),
			getSession: jest
				.fn()
				.mockResolvedValue({ data: { session: null }, error: null }),
			onAuthStateChange: jest.fn().mockReturnValue({
				data: { subscription: { unsubscribe: jest.fn() } },
			}),
		},
		from: jest.fn().mockReturnValue({
			select: jest.fn().mockReturnThis(),
			insert: jest.fn().mockReturnThis(),
			update: jest.fn().mockReturnThis(),
			delete: jest.fn().mockReturnThis(),
			eq: jest.fn().mockReturnThis(),
			order: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			single: jest.fn(),
		}),
		storage: {
			from: jest.fn().mockReturnValue({
				upload: jest.fn(),
				download: jest.fn(),
				remove: jest.fn(),
				getPublicUrl: jest
					.fn()
					.mockReturnValue({ data: { publicUrl: 'mocked-url' } }),
			}),
		},
	}),
}));

jest.mock('../config/supabase/supabase', () => ({
	supabase: {
		auth: {
			signUp: jest.fn().mockResolvedValue({ data: null, error: null }),
			signInWithPassword: jest
				.fn()
				.mockResolvedValue({ data: null, error: null }),
			signOut: jest.fn().mockResolvedValue({ error: null }),
			resetPasswordForEmail: jest
				.fn()
				.mockResolvedValue({ data: null, error: null }),
			updateUser: jest
				.fn()
				.mockResolvedValue({ data: null, error: null }),
			getSession: jest
				.fn()
				.mockResolvedValue({ data: { session: null }, error: null }),
			onAuthStateChange: jest.fn().mockReturnValue({
				data: { subscription: { unsubscribe: jest.fn() } },
			}),
		},
		from: jest.fn().mockReturnValue({
			select: jest.fn().mockReturnThis(),
			insert: jest.fn().mockReturnThis(),
			update: jest.fn().mockReturnThis(),
			delete: jest.fn().mockReturnThis(),
			eq: jest.fn().mockReturnThis(),
			order: jest.fn().mockReturnThis(),
			limit: jest.fn().mockReturnThis(),
			single: jest.fn(),
		}),
		storage: {
			from: jest.fn().mockReturnValue({
				upload: jest.fn(),
				download: jest.fn(),
				remove: jest.fn(),
				getPublicUrl: jest
					.fn()
					.mockReturnValue({ data: { publicUrl: 'mocked-url' } }),
			}),
		},
	},
}));

import i18n from '../locales/i18n';

beforeAll(async () => {
	if (!i18n.isInitialized) {
		await i18n.init();
	}
	await i18n.changeLanguage('en');
});

jest.mock('react-native-reanimated', () => {
	const { View } = require('react-native');
	return {
		...jest.requireActual('react-native-reanimated/mock'),
		useSharedValue: jest.fn().mockReturnValue({ value: 1 }),
		useAnimatedStyle: jest.fn().mockReturnValue({}),
		withSpring: jest.fn().mockImplementation((toValue) => toValue),
		withTiming: jest.fn().mockImplementation((toValue) => toValue),
		runOnJS: jest.fn().mockImplementation((fn) => fn),
		runOnUI: jest.fn().mockImplementation((fn) => fn),
		createAnimatedComponent: jest.fn().mockReturnValue(View),
		makeMutable: jest.fn().mockReturnValue({ value: 0 }),
		interpolate: jest.fn(),
		Extrapolate: { CLAMP: 'clamp' },
	};
});

jest.mock('expo-haptics', () => ({
	impactAsync: jest.fn(),
	notificationAsync: jest.fn(),
	selectionAsync: jest.fn(),
	ImpactFeedbackStyle: {
		Light: 'light',
		Medium: 'medium',
		Heavy: 'heavy',
	},
	NotificationFeedbackType: {
		Success: 'success',
		Warning: 'warning',
		Error: 'error',
	},
}));

jest.mock('../services/TODO/FormValidationService', () => ({
	FormValidationService: {
		validateUsername: jest.fn(),
		validateFirstName: jest.fn(),
		validateLastName: jest.fn(),
		validateSneakerSize: jest.fn(),
		validateModel: jest.fn(),
		validateSize: jest.fn(),
		validateCondition: jest.fn(),
		validatePrice: jest.fn(),
	},
}));

jest.mock('../store/useListViewStore', () => ({
	useListViewStore: () => ({
		isListView: false,
		setIsListView: jest.fn(),
		toggleView: jest.fn(),
	}),
}));

jest.mock('../store/useCurrencyStore', () => ({
	useCurrencyStore: () => ({
		currency: 'EUR',
		setCurrency: jest.fn(),
		formattedPrice: jest.fn((price) => `€${price}`),
	}),
}));

jest.mock('../store/useLanguageStore', () => ({
	useLanguageStore: Object.assign(
		() => ({
			language: 'en',
			setLanguage: jest.fn(),
			currentLanguage: 'en',
		}),
		{
			getState: () => ({
				language: 'en',
				setLanguage: jest.fn(),
				currentLanguage: 'en',
			}),
			subscribe: jest.fn().mockReturnValue(() => {}),
		}
	),
}));

jest.mock('../hooks/useSizeConversion', () => ({
	useSizeConversion: () => ({
		formattedSize: jest.fn((size) => `${size} US`),
		convertSize: jest.fn(),
	}),
}));

const originalConsoleError = console.error;

beforeEach(() => {
	console.error = jest.fn();
});

afterEach(() => {
	cleanup();
	jest.clearAllMocks();
	console.error = originalConsoleError;
});

export const fillAndBlurInput = async (
	input: ReactTestInstance,
	value: string
) => {
	await act(async () => {
		fireEvent.changeText(input, value);
	});

	await act(async () => {
		fireEvent(input, 'blur');
	});

	await act(async () => {
		await new Promise((resolve) => setTimeout(resolve, 300));
	});

	await act(async () => {
		await new Promise(setImmediate);
	});
};
