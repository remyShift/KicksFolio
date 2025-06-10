import { useForm, FieldValues, Path, UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

interface FormControllerOptions<T extends FieldValues> extends UseFormProps<T> {
	schema: any;
	onSubmit?: (data: T) => Promise<void> | void;
	asyncValidation?: {
		[K in keyof T]?: (value: T[K]) => Promise<string | null>;
	};
}

export function useFormController<T extends FieldValues>({
	schema,
	onSubmit,
	asyncValidation,
	...formOptions
}: FormControllerOptions<T>) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [asyncErrors, setAsyncErrors] = useState<
		Partial<Record<keyof T, string>>
	>({});

	const form = useForm<T>({
		resolver: zodResolver(schema),
		mode: 'onSubmit',
		reValidateMode: 'onBlur',
		...formOptions,
	});

	const {
		handleSubmit,
		setError,
		clearErrors,
		trigger,
		formState: { errors, isValid },
	} = form;

	const validateFieldAsync = async (fieldName: keyof T, value: any) => {
		if (asyncValidation?.[fieldName]) {
			const errorMsg = await asyncValidation[fieldName]!(value);
			if (errorMsg) {
				setAsyncErrors((prev) => ({ ...prev, [fieldName]: errorMsg }));
				setError(fieldName as Path<T>, {
					type: 'manual',
					message: errorMsg,
				});
				return false;
			} else {
				setAsyncErrors((prev) => ({ ...prev, [fieldName]: undefined }));
				return true;
			}
		}
		return true;
	};

	const validateFieldOnBlur = async (fieldName: keyof T, value: any) => {
		await trigger(fieldName as Path<T>);

		if (
			asyncValidation?.[fieldName] &&
			value &&
			value.toString().trim() !== ''
		) {
			await validateFieldAsync(fieldName, value);
		}
	};

	const handleFieldFocus = (fieldName: keyof T) => {
		clearErrors(fieldName as Path<T>);
		setAsyncErrors((prev) => ({ ...prev, [fieldName]: undefined }));
	};

	const handleFormSubmit = handleSubmit(async (data) => {
		if (!onSubmit) return;

		setIsSubmitting(true);

		try {
			if (asyncValidation) {
				const asyncValidationPromises = Object.entries(
					asyncValidation
				).map(async ([fieldName, validator]) => {
					const isValid = await validateFieldAsync(
						fieldName as keyof T,
						data[fieldName as keyof T]
					);
					return { fieldName, isValid };
				});

				const results = await Promise.all(asyncValidationPromises);
				const hasAsyncErrors = results.some(
					(result) => !result.isValid
				);

				if (hasAsyncErrors) {
					setIsSubmitting(false);
					return;
				}
			}

			await onSubmit(data);
		} catch (error) {
			console.error('Form submission error:', error);
		} finally {
			setIsSubmitting(false);
		}
	});

	const getFieldError = (fieldName: keyof T): string | undefined => {
		return (
			(errors[fieldName as Path<T>]?.message as string) ||
			asyncErrors[fieldName]
		);
	};

	const hasFieldError = (fieldName: keyof T): boolean => {
		if (errors[fieldName as Path<T>]?.message) {
			return true;
		}
		if (asyncErrors[fieldName]) {
			return true;
		}
		return false;
	};

	const isSubmitDisabled =
		!isValid ||
		isSubmitting ||
		Object.keys(asyncErrors).some((key) => asyncErrors[key as keyof T]);

	return {
		...form,
		handleFormSubmit,
		handleFieldFocus,
		validateFieldAsync,
		validateFieldOnBlur,
		getFieldError,
		hasFieldError,
		isSubmitDisabled,
		isSubmitting,
	};
}
