import { create } from 'zustand';

export interface BugReportFormData {
	title: string;
	description: string;
	stepsToReproduce: string;
	expectedBehavior: string;
	actualBehavior: string;
	deviceInfo: string;
	priority: 'low' | 'medium' | 'high';
}

interface BugReportStore {
	isVisible: boolean;
	isLoading: boolean;
	errorMsg: string;
	formData: BugReportFormData;

	setIsVisible: (isVisible: boolean) => void;
	setIsLoading: (isLoading: boolean) => void;
	setErrorMsg: (error: string) => void;
	updateFormData: (data: Partial<BugReportFormData>) => void;
	resetFormData: () => void;
	resetStore: () => void;
}

const initialFormData: BugReportFormData = {
	title: '',
	description: '',
	stepsToReproduce: '',
	expectedBehavior: '',
	actualBehavior: '',
	deviceInfo: '',
	priority: 'medium',
};

export const useBugReportStore = create<BugReportStore>((set, get) => ({
	isVisible: false,
	isLoading: false,
	errorMsg: '',
	formData: initialFormData,

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
}));
