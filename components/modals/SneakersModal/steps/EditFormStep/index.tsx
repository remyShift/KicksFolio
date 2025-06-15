import { View, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useRef, useEffect, useMemo } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/useFormController';
import { sneakerSchema, SneakerFormData } from '@/validation/schemas';
import { FormFields } from '../../shared/FormFields';

export const EditFormStep = () => {
    const scrollViewRef = useRef<ScrollView>(null);
    const modelInputRef = useRef<TextInput>(null);
    const brandInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const pricePaidInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    
    const { currentSneaker, sneakerToAdd, setSneakerToAdd, setValidateForm, setClearFormErrors, errorMsg, setErrorMsg } = useModalStore();

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
        formState: { isValid },
        displayedError,
        getFieldErrorWrapper,
    } = useFormController<SneakerFormData>({
        schema: sneakerSchema,
        fieldNames: ['model', 'brand', 'status', 'size', 'condition', 'price_paid', 'images'],
        authErrorMsg: errorMsg,
        defaultValues: {
            model: currentSneaker?.model || '',
            brand: currentSneaker?.brand || '',
            status: currentSneaker?.status || '',
            size: currentSneaker?.size ? String(currentSneaker.size) : '',
            condition: currentSneaker?.condition ? String(currentSneaker.condition) : '',
            price_paid: currentSneaker?.price_paid ? String(currentSneaker.price_paid) : '',
            description: currentSneaker?.description || '',
            images: [],
        },
        onSubmit: async (data) => {
            setSneakerToAdd({
                model: data.model,
                brand: data.brand,
                status: data.status,
                size: data.size,
                condition: data.condition,
                price_paid: data.price_paid || '',
                description: data.description || '',
                images: currentSneaker?.images || [],
            } as SneakerFormData);
        },
    });

    useEffect(() => {
        if (currentSneaker) {
            reset({
                model: currentSneaker.model || '',
                brand: currentSneaker.brand || '',
                status: currentSneaker.status || '',
                size: currentSneaker.size?.toString() || '',
                condition: currentSneaker.condition.toString() || '',
                price_paid: currentSneaker.price_paid?.toString() || '',
                description: currentSneaker.description || '',
                images: currentSneaker.images || [],
            });
            
            setSneakerToAdd({
                model: currentSneaker.model || '',
                brand: currentSneaker.brand || '',
                status: currentSneaker.status || '',
                size: currentSneaker.size?.toString() || '',
                condition: currentSneaker.condition.toString() || '',
                images: currentSneaker.images || [],
                price_paid: currentSneaker.price_paid?.toString() || '',
                description: currentSneaker.description || '',
            } as any);
        }
    }, [currentSneaker]);

    const formValues = watch();

    useEffect(() => {
        if (currentSneaker?.images && currentSneaker.images.length > 0 && 
            (!sneakerToAdd?.images || sneakerToAdd.images.length === 0)) {
            setSneakerToAdd({
                model: sneakerToAdd?.model || currentSneaker.model || '',
                brand: sneakerToAdd?.brand || currentSneaker.brand || '',
                status: sneakerToAdd?.status || currentSneaker.status || '',
                size: sneakerToAdd?.size || currentSneaker.size?.toString() || '',
                condition: sneakerToAdd?.condition || currentSneaker.condition.toString() || '',
                price_paid: sneakerToAdd?.price_paid || currentSneaker.price_paid?.toString() || '',
                description: sneakerToAdd?.description || currentSneaker.description || '',
                images: currentSneaker.images,
            } as SneakerFormData);
        }
    }, [currentSneaker?.images, sneakerToAdd]);

    useEffect(() => {
                const handleValidateAndSubmit = async () => {
            setErrorMsg('');
            const isFormValid = await trigger();
            
            if (isFormValid) {
                // Récupérer les données actuelles du formulaire
                const currentFormValues = watch();
                const finalData = {
                    model: currentFormValues.model || '',
                    brand: currentFormValues.brand || '',
                    status: currentFormValues.status || '',
                    size: currentFormValues.size || '',
                    condition: currentFormValues.condition || '',
                    price_paid: currentFormValues.price_paid || '',
                    description: currentFormValues.description || '',
                    images: currentSneaker?.images || [],
                } as SneakerFormData;
                
                setSneakerToAdd(finalData);
                return { isValid: true, errorMsg: '', data: finalData };
            } else {                
                const firstError = getFieldError('model') || 
                                    getFieldError('brand') || 
                                    getFieldError('status') || 
                                    getFieldError('size') || 
                                    getFieldError('condition') || 
                                    getFieldError('price_paid') || 
                                    getFieldError('images') ||
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

    useEffect(() => {
        return () => {
            setSneakerToAdd(null);
        };
    }, []);

    // La logique d'affichage des erreurs est maintenant gérée par useFormController

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
                        handleFieldFocus={handleFieldFocus}
                        validateFieldOnBlur={validateFieldOnBlur}
                        getFieldError={getFieldErrorWrapper}
                        modelInputRef={modelInputRef}
                        brandInputRef={brandInputRef}
                        sizeInputRef={sizeInputRef}
                        pricePaidInputRef={pricePaidInputRef}
                        descriptionInputRef={descriptionInputRef}
                        displayedError={displayedError}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}; 