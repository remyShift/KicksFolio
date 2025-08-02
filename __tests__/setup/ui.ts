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

jest.mock('react-native-gesture-handler', () => {
	const { View } = require('react-native');
	return {
		...require('react-native-gesture-handler/jestSetup'),
		Gesture: {
			Tap: () => ({
				onBegin: jest.fn().mockReturnThis(),
				onEnd: jest.fn().mockReturnThis(),
				onFinalize: jest.fn().mockReturnThis(),
				enabled: jest.fn().mockReturnThis(),
				shouldCancelWhenOutside: jest.fn().mockReturnThis(),
			}),
			Pan: () => ({
				onBegin: jest.fn().mockReturnThis(),
				onUpdate: jest.fn().mockReturnThis(),
				onEnd: jest.fn().mockReturnThis(),
				enabled: jest.fn().mockReturnThis(),
			}),
		},
		GestureDetector: View,
		gestureHandlerRootHOC: (Component: React.ComponentType<unknown>) =>
			Component,
	};
});

jest.mock('react-native-reanimated', () => {
	const Reanimated = require('react-native-reanimated/mock');
	Reanimated.default.call = () => {};
	return Reanimated;
});

jest.mock('expo-haptics', () => ({
	impactAsync: jest.fn(),
	notificationAsync: jest.fn(),
	selectionAsync: jest.fn(),
	ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
	NotificationFeedbackType: {
		Success: 'success',
		Warning: 'warning',
		Error: 'error',
	},
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
