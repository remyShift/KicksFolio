import { useState, RefObject } from 'react';
import { ScrollView, TextInput } from 'react-native';
import { FormService } from '@/services/FormService';
import { FormValidationService } from '@/services/FormValidationService';

type ErrorSetters = {
    [key: string]: (isError: boolean) => void;
};

type FocusSetters = {
    [key: string]: (isFocused: boolean) => void;
};

interface UseFormProps {
    errorSetters: ErrorSetters;
    focusSetters?: FocusSetters;
    scrollViewRef?: RefObject<ScrollView>;
}

export const useForm = ({ errorSetters, focusSetters, scrollViewRef }: UseFormProps) => {
    const [errorMsg, setErrorMsg] = useState('');
    const handleForm = new FormService(
        setErrorMsg,
        errorSetters,
        focusSetters,
        scrollViewRef
    );

    const formValidation = new FormValidationService(
        setErrorMsg,
        errorSetters
    );

    return {
        errorMsg,
        handleForm,
        formValidation
    };
}; 