import { View, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native';
import { useRef, useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/useFormController';
import { sneakerSchema, SneakerFormData } from '@/validation/schemas';
import { FormFields } from '../../shared/FormFields';

export const FormStep = () => {
    const scrollViewRef = useRef<ScrollView>(null);
    const modelInputRef = useRef<TextInput>(null);
    const brandInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const pricePaidInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    
    const { fetchedSneaker, setFetchedSneaker, sneakerToAdd, setSneakerToAdd, setValidateForm, setClearFormErrors, errorMsg, setErrorMsg } = useModalStore();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        getFieldError,
        hasFieldError,
        reset,
        trigger,
        watch,
        formState: { isValid }
    } = useFormController<SneakerFormData>({
        schema: sneakerSchema,
        defaultValues: {
            model: '',
            brand: '',
            status: '',
            size: '',
            condition: '',
            price_paid: '',
            description: '',
            images: [],
        },
        onSubmit: async (data) => {
            setSneakerToAdd({
                model: data.model,
                brand: data.brand,
                status: data.status,
                size: data.size,
                condition: data.condition,
                price_paid: data.price_paid,
                description: data.description,
                images: sneakerToAdd?.images || [],
            } as SneakerFormData);
        },
    });

    useEffect(() => {
        if (fetchedSneaker) {
            reset({
                model: fetchedSneaker.model || '',
                brand: fetchedSneaker.brand || '',
                status: '',
                size: '',
                condition: '',
                price_paid: '',
                description: fetchedSneaker.description || '',
                images: fetchedSneaker.image?.url ? [{ url: fetchedSneaker.image.url }] : [],
            });
            
            setSneakerToAdd({
                model: fetchedSneaker.model || '',
                brand: fetchedSneaker.brand || '',
                status: '',
                size: '',
                condition: '',
                images: fetchedSneaker.image?.url ? [{ url: fetchedSneaker.image.url }] : [],
                price_paid: '',
                description: fetchedSneaker.description || '',
            } as SneakerFormData);
            
            setFetchedSneaker(null);
        }
    }, [fetchedSneaker]);

    useEffect(() => {
        const handleValidateAndSubmit = async () => {
            setErrorMsg('');
            
            const isFormValid = await trigger();
            
            if (isFormValid) {
                return { isValid: true, errorMsg: '' };
            } else {
                const firstError = getFieldError('model') || 
                                 getFieldError('brand') || 
                                 getFieldError('status') || 
                                 getFieldError('size') || 
                                 getFieldError('condition') || 
                                 getFieldError('price_paid') || 
                                 'Please correct the errors in the form';
                
                return { isValid: false, errorMsg: firstError };
            }
        };

        const clearFormErrors = () => {
            reset();
            setErrorMsg('');
        };

        setValidateForm(handleValidateAndSubmit);
        setClearFormErrors(clearFormErrors);
        
        return () => {
            setValidateForm(null);
            setClearFormErrors(null);
        };
    }, []);

    const formValues = watch();
    useEffect(() => {
        if (formValues && Object.keys(formValues).length > 0) {
            setSneakerToAdd({
                model: formValues.model || '',
                brand: formValues.brand || '',
                status: formValues.status || '',
                size: formValues.size || '',
                condition: formValues.condition || '',
                price_paid: formValues.price_paid || '',
                description: formValues.description || '',
                images: formValues.images || [],
            } as SneakerFormData);
        }
    }, [formValues.model, formValues.brand, formValues.status, formValues.size, formValues.condition, formValues.price_paid, formValues.description]);

    useEffect(() => {
        return () => {
            setSneakerToAdd(null);
        };
    }, []);

    const hasMultipleErrors = [
        hasFieldError('model'),
        hasFieldError('brand'),
        hasFieldError('status'),
        hasFieldError('size'),
        hasFieldError('condition'),
    ].filter(Boolean).length > 1;

    const globalErrorMsg = hasMultipleErrors 
        ? 'Please correct the fields in red before continuing'
        : '';

    const displayedError = globalErrorMsg || 
        getFieldError('model') || 
        getFieldError('brand') || 
        getFieldError('status') || 
        getFieldError('size') || 
        getFieldError('condition') || 
        getFieldError('price_paid') || 
        errorMsg || 
        '';

    const getFieldErrorWrapper = (fieldName: string) => {
        return getFieldError(fieldName as keyof typeof sneakerSchema._type);
    };

    return (
        <KeyboardAvoidingView 
            className="flex-1" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}
        >
            <ScrollView 
                ref={scrollViewRef}
                className='flex-1'
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled={true}
                contentContainerStyle={{ minHeight: '100%' }}
            >
                <View className="flex-1 h-full p-2 gap-4">
                    <FormFields
                        control={control}
                        displayedError={displayedError}
                        handleFieldFocus={handleFieldFocus}
                        validateFieldOnBlur={validateFieldOnBlur}
                        getFieldError={getFieldErrorWrapper}
                        modelInputRef={modelInputRef}
                        brandInputRef={brandInputRef}
                        sizeInputRef={sizeInputRef}
                        pricePaidInputRef={pricePaidInputRef}
                        descriptionInputRef={descriptionInputRef}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};