import { TextInput, ScrollView } from "react-native";
import { RefObject } from "react";
import { FormValidationService } from "./FormValidationService";

type ErrorSetters = {
    [key: string]: (isError: boolean) => void;
};

type FocusSetters = {
    [key: string]: (isFocused: boolean) => void;
};

export type FieldName = 'username' | 'email' | 'password' | 'firstName' | 'lastName' | 'confirmPassword' | 'size' | 'collectionName' | 'sku';

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
        this.validationService = new FormValidationService(setErrorMsg, errorSetters);
    }

    public inputFocus(inputType: FieldName): void {
        if (this.focusSetters[inputType]) {
            this.focusSetters[inputType](true);
        }
        this.validationService.clearErrors();
        this.scrollToBottom();
    }

    public inputBlur(inputType: FieldName, value: string, password?: string, isLoginPage?: boolean, nextRef?: RefObject<TextInput>): void {
        if (this.focusSetters[inputType]) {
            this.focusSetters[inputType](false);
        }
        this.validationService.validateField(
            value,
            inputType,
            isLoginPage || false,
            nextRef || null,
            password
        );
    }
    
    public inputChange(
        text: string, 
        setter: (text: string) => void
    ): void {
        setter(text);
        this.validationService.clearErrors();
    }

    private scrollToBottom(): void {
        if (this.scrollViewRef?.current) {
            this.scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }

} 