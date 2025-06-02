import { TextInput, ScrollView } from 'react-native';
import { RefObject } from 'react';
import { FormValidationService } from './FormValidationService';

type ErrorSetters = {
	[key: string]: (isError: boolean) => void;
};

type FocusSetters = {
	[key: string]: (isFocused: boolean) => void;
};

export type FieldName =
	| 'username'
	| 'email'
	| 'password'
	| 'firstName'
	| 'lastName'
	| 'confirmPassword'
	| 'size'
	| 'collectionName'
	| 'sku';

export class FormService {
	private focusSetters: FocusSetters;
	private scrollViewRef: RefObject<ScrollView> | null;
	private validationService: FormValidationService;

	constructor(
		setErrorMsg: (msg: string) => void,
		errorSetters: ErrorSetters,
		focusSetters?: FocusSetters,
		scrollViewRef?: RefObject<ScrollView>
	) {
		this.focusSetters = focusSetters || {};
		this.scrollViewRef = scrollViewRef || null;
		this.validationService = new FormValidationService(
			setErrorMsg,
			errorSetters
		);
	}

	public inputFocus(inputType: FieldName): void {
		if (this.focusSetters[inputType]) {
			this.focusSetters[inputType](true);
		}
		this.validationService.clearErrors();
		this.scrollToBottom();
	}

	public async inputBlur(
		inputType: FieldName,
		value: string,
		isLoginPage?: boolean,
		password?: string,
		nextRef?: RefObject<TextInput>
	): Promise<boolean> {
		if (this.focusSetters[inputType]) {
			this.focusSetters[inputType](false);
		}
		return this.validationService.validateField(
			value,
			inputType,
			isLoginPage || false,
			nextRef || null,
			password || undefined
		);
	}

	public inputChange(text: string, setter: (text: string) => void): void {
		setter(text);
		this.validationService.clearErrors();
	}

	private scrollToBottom(): void {
		if (this.scrollViewRef?.current) {
			this.scrollViewRef.current.scrollToEnd({ animated: true });
		}
	}
}
