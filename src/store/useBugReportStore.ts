import { create } from 'zustand';

export interface BugReportFormData {
	title: string;
	description: string;
	deviceInfo: string;
	priority: 'low' | 'medium' | 'high';
	userEmail?: string;
	username?: string;
}

interface BugReportStore {
	isVisible: boolean;
	isLoading: boolean;
	errorMsg: string;
	formData: BugReportFormData;
	validateForm:
		| (() => Promise<{
				isValid: boolean;
				errorMsg: string;
				data?: BugReportFormData;
		  }>)
		| null;
	clearFormErrors: (() => void) | null;

	setIsVisible: (isVisible: boolean) => void;
	setIsLoading: (isLoading: boolean) => void;
	setErrorMsg: (error: string) => void;
	updateFormData: (data: Partial<BugReportFormData>) => void;
	resetFormData: () => void;
	resetStore: () => void;
	setValidateForm: (
		validateFn:
			| (() => Promise<{
					isValid: boolean;
					errorMsg: string;
					data?: BugReportFormData;
			  }>)
			| null
	) => void;
	setClearFormErrors: (clearFn: (() => void) | null) => void;
}

const initialFormData: BugReportFormData = {
	title: '',
	description: '',
	deviceInfo: '',
	priority: 'medium',
};

export const useBugReportStore = create<BugReportStore>((set, get) => ({
	isVisible: false,
	isLoading: false,
	errorMsg: '',
	formData: initialFormData,
	validateForm: null,
	clearFormErrors: null,

	setIsVisible: (isVisible) => set({ isVisible }),
	setIsLoading: (isLoading) => set({ isLoading }),
	setErrorMsg: (error) => set({ errorMsg: error }),

	updateFormData: (data) =>
		set((state) => ({
			formData: { ...state.formData, ...data },
		})),

	resetFormData: () => set({ formData: initialFormData }),

	resetStore: () =>
		set({
			isVisible: false,
			isLoading: false,
			errorMsg: '',
			formData: initialFormData,
		}),

	setValidateForm: (validateFn) => set({ validateForm: validateFn }),
	setClearFormErrors: (clearFn) => set({ clearFormErrors: clearFn }),
}));
