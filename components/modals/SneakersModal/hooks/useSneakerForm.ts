import { useState, RefObject } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { SneakerValidationService } from '@/services/SneakerValidationService';
import { useModalStore } from '@/store/useModalStore';

type ErrorSetters = {
	[key: string]: (isError: boolean) => void;
};

type FocusSetters = {
	[key: string]: (isFocused: boolean) => void;
};

export function useSneakerForm({
	errorSetters,
	focusSetters,
	scrollViewRef,
}: {
	errorSetters: ErrorSetters;
	focusSetters: FocusSetters;
	scrollViewRef: RefObject<ScrollView>;
}) {
	const [errorMsg, setErrorMsg] = useState('');
	const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>(
		{}
	);
	const sneakerFormValidationService = new SneakerValidationService();
	const { clearFormErrors } = useModalStore();

	const handleForm = {
		inputFocus: (inputType: string) => {
			if (focusSetters[inputType]) {
				focusSetters[inputType](true);
			}
			setErrorMsg('');
			setFieldErrors((prev) => ({ ...prev, [inputType]: '' }));
			// Clear all form errors when focusing on any input
			if (clearFormErrors) {
				clearFormErrors();
			}
			if (scrollViewRef?.current) {
				scrollViewRef.current.scrollToEnd({ animated: true });
			}
		},

		inputBlur: async (
			inputType: string,
			value: string
		): Promise<boolean> => {
			if (focusSetters[inputType]) {
				focusSetters[inputType](false);
			}

			const result = sneakerFormValidationService.validateField(
				inputType,
				value
			);

			if (!result.isValid) {
				setErrorMsg(result.errorMsg);
				setFieldErrors((prev) => ({
					...prev,
					[inputType]: result.errorMsg,
				}));
				if (errorSetters[inputType]) {
					errorSetters[inputType](true);
				}
			} else {
				setFieldErrors((prev) => ({ ...prev, [inputType]: '' }));
				if (errorSetters[inputType]) {
					errorSetters[inputType](false);
				}
			}

			return result.isValid;
		},

		inputChange: (text: string, setter: (text: string) => void) => {
			setter(text);
			setErrorMsg('');
		},
	};

	return {
		handleForm,
		errorMsg,
		fieldErrors,
		sneakerFormValidationService,
	};
}
