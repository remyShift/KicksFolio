import { useAuth } from '@/hooks/useAuth';

interface FormErrorHandlingProps<T> {
	getFieldError: (fieldName: keyof T) => string | undefined;
	hasFieldError: (fieldName: keyof T) => boolean;
	handleFieldFocus: (fieldName: keyof T) => void;
	fieldNames: (keyof T)[];
	authErrorMsg?: string;
	enableClearError?: boolean;
}

export function useFormErrorHandling<T>({
	getFieldError,
	hasFieldError,
	handleFieldFocus,
	fieldNames,
	authErrorMsg,
	enableClearError = true,
}: FormErrorHandlingProps<T>) {
	const { clearError } = useAuth();

	const handleFieldFocusWithClearError = (fieldName: keyof T) => {
		handleFieldFocus(fieldName);
		if (enableClearError && clearError) {
			clearError();
		}
	};

	const hasMultipleErrors =
		fieldNames.filter((fieldName) => hasFieldError(fieldName)).length > 1;

	const globalErrorMsg = hasMultipleErrors
		? 'Please correct the fields in red before continuing'
		: '';

	const getFirstFieldError = () => {
		for (const fieldName of fieldNames) {
			const error = getFieldError(fieldName);
			if (error) {
				return error;
			}
		}
		return '';
	};

	const displayedError =
		globalErrorMsg || getFirstFieldError() || authErrorMsg || '';

	const getFieldErrorWrapper = (fieldName: string) => {
		return getFieldError(fieldName as keyof T);
	};

	return {
		handleFieldFocusWithClearError,
		hasMultipleErrors,
		globalErrorMsg,
		displayedError,
		getFieldErrorWrapper,
	};
}
