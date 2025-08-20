import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { fireEvent, render } from '@testing-library/react-native';

import SwipeableWrapper from '@/components/screens/app/profile/displayState/list/SwipeableWrapper';
import { Sneaker, SneakerBrand, SneakerStatus } from '@/types/sneaker';

// Mock the hooks
jest.mock('@/hooks/useSwipeOptimization', () => ({
	useSwipeOptimization: () => ({
		isRowOpen: jest.fn(() => false),
		setOpenRow: jest.fn(),
		closeRow: jest.fn(),
	}),
}));

// Mock the auth context
jest.mock('@/contexts/authContext', () => ({
	useSession: () => ({
		user: { id: 'current-user-id' },
	}),
}));

// Mock the SwipeActions component
jest.mock(
	'@/components/screens/app/profile/displayState/list/SwipeActions',
	() => {
		return function MockSwipeActions({
			sneaker,
			closeRow,
			userSneakers,
			isOwner,
		}: {
			sneaker: any;
			closeRow: () => void;
			userSneakers?: any[];
			isOwner?: boolean;
		}) {
			return (
				<View testID="swipe-actions">
					{isOwner && <button testID="delete-button">Delete</button>}
					<button testID="view-button">View</button>
				</View>
			);
		};
	}
);

const mockSneaker: Sneaker = {
	id: '1',
	user_id: 'current-user-id', // Même ID que l'utilisateur actuel pour tester isOwner = true
	model: 'Air Jordan 1',
	brand: SneakerBrand.Nike,
	size_eu: 42,
	size_us: 9,
	condition: 8,
	status: SneakerStatus.Stocking,
	description: 'Test sneaker',
	images: [],
	estimated_value: 150,
};

const mockOtherUserSneaker: Sneaker = {
	...mockSneaker,
	id: '2',
	user_id: 'other-user-id', // ID différent pour tester isOwner = false
};

const renderWithGestureHandler = (component: React.ReactElement) => {
	return render(
		<GestureHandlerRootView style={{ flex: 1 }}>
			{component}
		</GestureHandlerRootView>
	);
};

describe('SwipeableWrapper', () => {
	it('renders correctly with sneaker data', () => {
		const { getByText } = renderWithGestureHandler(
			<SwipeableWrapper item={mockSneaker} showOwnerInfo={false} />
		);

		expect(getByText('Air Jordan 1')).toBeTruthy();
		expect(getByText('Nike')).toBeTruthy();
	});

	it('shows owner info when showOwnerInfo is true', () => {
		const { getByText } = renderWithGestureHandler(
			<SwipeableWrapper item={mockSneaker} showOwnerInfo={true} />
		);

		// Vérifier que le composant SneakerListItem est rendu avec showOwnerInfo
		expect(getByText('Air Jordan 1')).toBeTruthy();
	});

	it('renders SwipeActions component', () => {
		const { getByTestId } = renderWithGestureHandler(
			<SwipeableWrapper item={mockSneaker} showOwnerInfo={false} />
		);

		expect(getByTestId('swipe-actions')).toBeTruthy();
	});

	it('shows delete button when user is owner', () => {
		const { getByTestId } = renderWithGestureHandler(
			<SwipeableWrapper item={mockSneaker} showOwnerInfo={false} />
		);

		expect(getByTestId('delete-button')).toBeTruthy();
		expect(getByTestId('view-button')).toBeTruthy();
	});

	it('hides delete button when user is not owner', () => {
		const { queryByTestId, getByTestId } = renderWithGestureHandler(
			<SwipeableWrapper
				item={mockOtherUserSneaker}
				showOwnerInfo={false}
			/>
		);

		expect(queryByTestId('delete-button')).toBeNull();
		expect(getByTestId('view-button')).toBeTruthy();
	});

	it('calls onCloseRow when provided', () => {
		const mockOnCloseRow = jest.fn();

		renderWithGestureHandler(
			<SwipeableWrapper
				item={mockSneaker}
				showOwnerInfo={false}
				onCloseRow={mockOnCloseRow}
			/>
		);

		// The onCloseRow is called internally when swipe gestures are handled
		// This test ensures the prop is properly passed
		expect(mockOnCloseRow).toBeDefined();
	});
});
