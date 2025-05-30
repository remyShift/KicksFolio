import { renderHook, act } from '@testing-library/react-native';
import { useForm } from '@/hooks/useForm';
import { useRef } from 'react';
import { TextInput, ScrollView } from 'react-native';

// Mock des refs
const mockScrollViewRef = {
	current: {
		scrollToEnd: jest.fn(),
	},
} as any;

const mockErrorSetters = {
	username: jest.fn(),
	email: jest.fn(),
	password: jest.fn(),
};

const mockFocusSetters = {
	username: jest.fn(),
	email: jest.fn(),
	password: jest.fn(),
};

describe('useForm', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('initialization', () => {
		it('should initialize with default parameters', () => {
			const { result } = renderHook(() =>
				useForm({
					errorSetters: mockErrorSetters,
					focusSetters: mockFocusSetters,
					scrollViewRef: mockScrollViewRef,
				})
			);

			expect(result.current.handleForm).toBeDefined();
			expect(result.current.errorMsg).toBe('');
		});

		it('should work without scrollViewRef', () => {
			const { result } = renderHook(() =>
				useForm({
					errorSetters: mockErrorSetters,
					focusSetters: mockFocusSetters,
				})
			);

			expect(result.current.handleForm).toBeDefined();
		});
	});

	describe('inputFocus', () => {
		it('should call focus setter and clear errors', () => {
			const { result } = renderHook(() =>
				useForm({
					errorSetters: mockErrorSetters,
					focusSetters: mockFocusSetters,
					scrollViewRef: mockScrollViewRef,
				})
			);

			act(() => {
				result.current.handleForm.inputFocus('username');
			});

			expect(mockFocusSetters.username).toHaveBeenCalledWith(true);
			expect(mockScrollViewRef.current.scrollToEnd).toHaveBeenCalledWith({
				animated: true,
			});
		});

		it('should handle focus without scrollViewRef', () => {
			const { result } = renderHook(() =>
				useForm({
					errorSetters: mockErrorSetters,
					focusSetters: mockFocusSetters,
				})
			);

			act(() => {
				result.current.handleForm.inputFocus('username');
			});

			expect(mockFocusSetters.username).toHaveBeenCalledWith(true);
		});
	});

	describe('inputBlur', () => {
		it('should call focus setter with false and validate field', async () => {
			const { result } = renderHook(() =>
				useForm({
					errorSetters: mockErrorSetters,
					focusSetters: mockFocusSetters,
					scrollViewRef: mockScrollViewRef,
				})
			);

			await act(async () => {
				result.current.handleForm.inputBlur('username', 'testuser');
			});

			expect(mockFocusSetters.username).toHaveBeenCalledWith(false);
		});

		it('should handle blur with password parameter', async () => {
			const { result } = renderHook(() =>
				useForm({
					errorSetters: mockErrorSetters,
					focusSetters: mockFocusSetters,
					scrollViewRef: mockScrollViewRef,
				})
			);

			await act(async () => {
				result.current.handleForm.inputBlur(
					'password',
					'Password123',
					'Password123'
				);
			});

			expect(mockFocusSetters.password).toHaveBeenCalledWith(false);
		});
	});

	describe('inputChange', () => {
		it('should call setter and clear errors', () => {
			const mockSetter = jest.fn();
			const { result } = renderHook(() =>
				useForm({
					errorSetters: mockErrorSetters,
					focusSetters: mockFocusSetters,
					scrollViewRef: mockScrollViewRef,
				})
			);

			act(() => {
				result.current.handleForm.inputChange('test', mockSetter);
			});

			expect(mockSetter).toHaveBeenCalledWith('test');
		});
	});

	describe('error handling', () => {
		it('should not crash when calling non-existent setter', () => {
			const { result } = renderHook(() =>
				useForm({
					errorSetters: {},
					focusSetters: {},
					scrollViewRef: mockScrollViewRef,
				})
			);

			expect(() => {
				act(() => {
					result.current.handleForm.inputFocus('nonexistent' as any);
				});
			}).not.toThrow();
		});
	});

	describe('scrolling behavior', () => {
		it('should scroll to bottom on input focus', () => {
			const { result } = renderHook(() =>
				useForm({
					errorSetters: mockErrorSetters,
					focusSetters: mockFocusSetters,
					scrollViewRef: mockScrollViewRef,
				})
			);

			act(() => {
				result.current.handleForm.inputFocus('username');
			});

			expect(mockScrollViewRef.current.scrollToEnd).toHaveBeenCalledWith({
				animated: true,
			});
		});

		it('should handle missing scrollView gracefully', () => {
			const nullScrollViewRef = { current: null } as any;
			const { result } = renderHook(() =>
				useForm({
					errorSetters: mockErrorSetters,
					focusSetters: mockFocusSetters,
					scrollViewRef: nullScrollViewRef,
				})
			);

			expect(() => {
				act(() => {
					result.current.handleForm.inputFocus('username');
				});
			}).not.toThrow();
		});
	});
});
