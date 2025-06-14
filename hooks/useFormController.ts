import {
	useForm,
	FieldValues,
	Path,
	UseFormProps,
	DefaultValues,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';

interface FormControllerOptions<T extends FieldValues>
	extends Omit<UseFormProps<T>, 'defaultValues'> {
	schema: any;
	onSubmit?: (data: T) => Promise<void> | void;
	asyncValidation?: {
		[K in keyof T]?: (value: T[K]) => Promise<string | null>;
	};
	defaultValues?: DefaultValues<T>;
	isEditForm?: boolean;
}

export function useFormController<T extends FieldValues>({
	schema,
	onSubmit,
	asyncValidation,
	defaultValues,
	isEditForm = false,
	...formOptions
}: FormControllerOptions<T>) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [asyncErrors, setAsyncErrors] = useState<
		Partial<Record<keyof T, string>>
	>({});
	const [hasChanges, setHasChanges] = useState(false);

	const form = useForm<T>({
		resolver: zodResolver(schema),
		mode: 'onSubmit',
		reValidateMode: 'onBlur',
		defaultValues,
		...formOptions,
	});

	const {
		handleSubmit,
		setError,
		clearErrors,
		trigger,
		watch,
		formState: { errors, isValid },
	} = form;

	const formValues = watch();

	useEffect(() => {
		if (!defaultValues || !isEditForm) return;

		const hasFormChanges = Object.keys(formValues).some((key) => {
			const currentValue = formValues[key as keyof T];
			const defaultValue = (defaultValues as Record<string, any>)[key];
			const currentValueStr = String(currentValue);
			const defaultValueStr = String(defaultValue);

			return currentValueStr !== defaultValueStr;
		});
		setHasChanges(hasFormChanges);
	}, [formValues, defaultValues, isEditForm]);

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

	const validateFieldOnBlur = async (
		fieldName: keyof T,
		value: string | number
	) => {
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

	const processAsyncValidation = async (data: T) => {
		if (asyncValidation) {
			const asyncValidationPromises = Object.entries(asyncValidation).map(
				async ([fieldName]) => {
					const isValid = await validateFieldAsync(
						fieldName as keyof T,
						data[fieldName as keyof T]
					);
					return { fieldName, isValid };
				}
			);

			return Promise.all(asyncValidationPromises).then((results) => {
				const hasAsyncErrors = results.some(
					(result) => !result.isValid
				);

				if (hasAsyncErrors) {
					setIsSubmitting(false);
					return Promise.reject('Async validation failed');
				}
				return Promise.resolve();
			});
		}
		return Promise.resolve();
	};

	const handleFormSubmit = handleSubmit(async (data) => {
		if (!onSubmit) return;

		setIsSubmitting(true);

		await processAsyncValidation(data)
			.then(() => {
				return onSubmit(data);
			})
			.then(() => {
				setIsSubmitting(false);
			})
			.catch((error) => {
				console.error('Form submission error:', error);
				setIsSubmitting(false);
			});
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

	const isSubmitDisabled = isEditForm
		? isSubmitting ||
		  Object.keys(asyncErrors).some((key) => asyncErrors[key as keyof T]) ||
		  !hasChanges
		: !isValid ||
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
		isValid,
		hasChanges,
	};
}
