import { ForwardedRef, RefObject } from 'react';

import { Keyboard, TextInput } from 'react-native';

interface UseInputSubmitProps {
	ref: ForwardedRef<TextInput>;
	fieldName: string;
	getFieldError: (fieldName: string) => string | undefined;
	nextInputRef?: RefObject<TextInput | null>;
	onSubmitEditing?: () => void;
	setIsFocused: (value: boolean) => void;
	onBlur?: (value: string) => Promise<void>;
	value?: string;
}

export const useInputSubmit = ({
	ref,
	fieldName,
	getFieldError,
	nextInputRef,
	onSubmitEditing,
	setIsFocused,
	onBlur,
	value,
}: UseInputSubmitProps) => {
	const handleSubmitEditing = async () => {
		if (onBlur && value) {
			await onBlur(value);
		}

		const currentError = getFieldError(fieldName);

		if (currentError) {
			setIsFocused(false);
			Keyboard.dismiss();
			(ref as React.RefObject<TextInput>)?.current?.blur();
			return;
		}

		if (onSubmitEditing) {
			onSubmitEditing();
		} else if (nextInputRef && nextInputRef.current && !currentError) {
			nextInputRef.current.focus();
		}
	};

	return { handleSubmitEditing };
};
