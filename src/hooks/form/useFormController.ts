import { useEffect, useMemo, useState } from 'react';

import {
	DefaultValues,
	FieldValues,
	Path,
	useForm,
	UseFormProps,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { zodResolver } from '@hookform/resolvers/zod';

import { useSession } from '@/contexts/authContext';

import { useAuth } from '../auth/useAuth';

interface FormControllerOptions<T extends FieldValues>
	extends Omit<UseFormProps<T>, 'defaultValues'> {
	schema: any;
	onSubmit?: (data: T) => Promise<void> | void;
	asyncValidation?: {
		[K in keyof T]?: (value: T[K]) => Promise<string | null>;
	};
	defaultValues?: DefaultValues<T>;
	isEditForm?: boolean;
	fieldNames?: (keyof T)[];
	authErrorMsg?: string;
	enableClearError?: boolean;
}

export function useFormController<T extends FieldValues>({
	schema,
	onSubmit,
	asyncValidation,
	defaultValues,
	isEditForm = false,
	fieldNames = [],
	authErrorMsg,
	enableClearError = true,
	...formOptions
}: FormControllerOptions<T>) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [asyncErrors, setAsyncErrors] = useState<
		Partial<Record<keyof T, string>>
	>({});
	const [hasChanges, setHasChanges] = useState(false);

	const { t } = useTranslation();
	const { clearError } = useAuth();
	const { refreshUserData } = useSession();

	const form = useForm<T>({
		resolver: zodResolver(schema),
		mode: 'onBlur',
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
		const errorMsg = await asyncValidation![fieldName]!(value);
		if (errorMsg) {
			setAsyncErrors((prev) => ({
				...prev,
				[fieldName]: errorMsg,
			}));
			setError(fieldName as Path<T>, {
				type: 'manual',
				message: errorMsg,
			});
			return false;
		} else {
			setAsyncErrors((prev) => ({
				...prev,
				[fieldName]: undefined,
			}));
			clearErrors(fieldName as Path<T>);
			return true;
		}
	};

	const validateFieldOnBlur = async (
		fieldName: keyof T,
		value: T[keyof T]
	) => {
		const validationResult = await trigger(fieldName as Path<T>);

		if (!validationResult) {
			const error = form.formState.errors[fieldName as Path<T>]
				?.message as string;
			setAsyncErrors((prev) => ({
				...prev,
				[fieldName]: error,
			}));
			return false;
		}

		if (asyncValidation?.[fieldName] && value) {
			const errorMsg = await asyncValidation[fieldName]!(value);
			if (errorMsg) {
				setAsyncErrors((prev) => ({
					...prev,
					[fieldName]: errorMsg,
				}));
				setError(fieldName as Path<T>, {
					type: 'manual',
					message: errorMsg,
				});
				return false;
			}
		}

		setAsyncErrors((prev) => ({
			...prev,
			[fieldName]: undefined,
		}));
		clearErrors(fieldName as Path<T>);
		return true;
	};

	const handleFieldFocus = (fieldName: keyof T) => {
		clearErrors(fieldName as Path<T>);
		setAsyncErrors((prev) => ({
			...prev,
			[fieldName]: undefined,
		}));
		if (enableClearError && clearError) {
			clearError();
		}
	};

	const processAsyncValidation = async (data: T) => {
		if (asyncValidation) {
			const asyncValidationPromises = Object.entries(asyncValidation).map(
				async ([fieldName]) => {
					const isValid = await validateFieldAsync(
						fieldName as keyof T,
						data[fieldName as keyof T]
					);
					return {
						fieldName,
						isValid,
					};
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
		if (!onSubmit || isSubmitting) {
			return;
		}

		setIsSubmitting(true);

		await processAsyncValidation(data)
			.then(() => {
				return onSubmit(data);
			})
			.then(() => {
				setIsSubmitting(false);
				refreshUserData();
			})
			.catch((error) => {
				setIsSubmitting(false);
			});
	});

	const getFieldError = (fieldName: keyof T): string | undefined => {
		const syncError = errors[fieldName as Path<T>]?.message as string;
		const asyncError = asyncErrors[fieldName];
		return syncError || asyncError;
	};

	const hasFieldError = (fieldName: keyof T): boolean => {
		return !!getFieldError(fieldName);
	};

	const getErrorCount = (): number => {
		const syncErrorKeys = Object.keys(errors).filter(
			(key) => errors[key as Path<T>]?.message
		);

		const asyncErrorKeys = Object.keys(asyncErrors).filter(
			(key) => asyncErrors[key as keyof T] && !syncErrorKeys.includes(key)
		);

		return syncErrorKeys.length + asyncErrorKeys.length;
	};

	const hasMultipleErrors = getErrorCount() > 1;

	const getFirstFieldError = (): string => {
		if (fieldNames.length > 0) {
			for (const fieldName of fieldNames) {
				const error = getFieldError(fieldName);
				if (error) {
					return error;
				}
			}
		}

		const formErrorKeys = Object.keys(errors) as (keyof T)[];
		for (const fieldName of formErrorKeys) {
			const error = getFieldError(fieldName);
			if (error) {
				return error;
			}
		}

		const asyncErrorKeys = Object.keys(asyncErrors) as (keyof T)[];
		for (const fieldName of asyncErrorKeys) {
			if (asyncErrors[fieldName]) {
				return asyncErrors[fieldName] as string;
			}
		}

		return '';
	};

	const globalErrorMsg = useMemo(() => {
		const translation = t('ui.errors.global');
		return typeof translation === 'string'
			? translation
			: 'Multiple errors occurred';
	}, [t]);

	const displayedError = useMemo(() => {
		const errorCount = getErrorCount();

		if (errorCount === 0) {
			return authErrorMsg || '';
		}

		if (errorCount > 1) {
			return globalErrorMsg;
		}

		const firstError = getFirstFieldError();
		const result = firstError || authErrorMsg || '';

		return typeof result === 'string' ? result : '';
	}, [authErrorMsg, errors, asyncErrors, fieldNames, globalErrorMsg]);

	const getFieldErrorWrapper = (fieldName: string) => {
		return getFieldError(fieldName as keyof T);
	};

	const isSubmitDisabled = isEditForm
		? isSubmitting ||
			Object.keys(asyncErrors).some(
				(key) => asyncErrors[key as keyof T]
			) ||
			!hasChanges
		: !isValid ||
			isSubmitting ||
			Object.keys(asyncErrors).some(
				(key) => asyncErrors[key as keyof T]
			) ||
			Object.keys(errors).length > 0;

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
		globalErrorMsg,
		displayedError,
		getFieldErrorWrapper,
		hasMultipleErrors,
	};
}
