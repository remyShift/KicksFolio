import { useState, RefObject } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { SneakerValidationService } from '@/services/SneakerValidationService';

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
	const validationService = new SneakerValidationService(
		setErrorMsg,
		(isError) => {
			Object.values(errorSetters).forEach((setter) => setter(isError));
		}
	);

	const handleForm = {
		inputFocus: (inputType: string) => {
			if (focusSetters[inputType]) {
				focusSetters[inputType](true);
			}
			validationService.clearErrors();
			if (scrollViewRef?.current) {
				scrollViewRef.current.scrollToEnd({ animated: true });
			}
		},

		inputBlur: async (
			inputType: string,
			value: string,
			nextRef?: RefObject<TextInput>
		): Promise<boolean> => {
			if (focusSetters[inputType]) {
				focusSetters[inputType](false);
			}

			const isValid = validationService.validateField(inputType, value);

			if (isValid && nextRef?.current) {
				nextRef.current.focus();
			}

			return isValid;
		},

		inputChange: (text: string, setter: (text: string) => void) => {
			setter(text);
			validationService.clearErrors();
		},
	};

	return {
		handleForm,
		errorMsg,
	};
}
