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
        formState: { isValid },
        displayedError,
        getFieldErrorWrapper,
    } = useFormController<SneakerFormData>({
        schema: sneakerSchema,
        fieldNames: ['model', 'brand', 'status', 'size', 'condition', 'price_paid', 'images'],
        authErrorMsg: errorMsg,
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
            const imageData = fetchedSneaker.image?.url ? [{ url: fetchedSneaker.image.url }] : [];
            
            reset({
                model: fetchedSneaker.model || '',
                brand: fetchedSneaker.brand || '',
                status: '',
                size: '',
                condition: '',
                price_paid: '',
                description: fetchedSneaker.description || '',
                images: imageData,
            });
            
            setSneakerToAdd({
                model: fetchedSneaker.model || '',
                brand: fetchedSneaker.brand || '',
                status: '',
                size: '',
                condition: '',
                images: imageData,
                price_paid: '',
                description: fetchedSneaker.description || '',
            } as SneakerFormData);
            
            setFetchedSneaker(null);
        }
    }, [fetchedSneaker]);

    const formValues = watch();

    useEffect(() => {
        const handleValidateAndSubmit = async () => {
            setErrorMsg('');
            
            // Synchroniser les images du store avec le formulaire avant validation
            const currentSneakerToAdd = useModalStore.getState().sneakerToAdd;
            const currentFormValues = watch();
            
            if (currentSneakerToAdd?.images && currentSneakerToAdd.images.length > 0) {
                reset({
                    ...currentFormValues,
                    images: currentSneakerToAdd.images,
                });
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const isFormValid = await trigger();
            
            if (isFormValid) {
                const updatedFormValues = watch();
                
                if (!currentSneakerToAdd?.images || currentSneakerToAdd.images.length === 0) {
                    return { isValid: false, errorMsg: 'Please upload at least one image.' };
                }
                
                const finalData = {
                    model: updatedFormValues.model || '',
                    brand: updatedFormValues.brand || '',
                    status: updatedFormValues.status || '',
                    size: updatedFormValues.size || '',
                    condition: updatedFormValues.condition || '',
                    price_paid: updatedFormValues.price_paid || '',
                    description: updatedFormValues.description || '',
                    images: currentSneakerToAdd.images,
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
            setErrorMsg('');
            setSneakerToAdd({
                ...sneakerToAdd,
                images: [],
            } as SneakerFormData);
        };
    }, []);

    // La logique d'affichage des erreurs est maintenant gérée par useFormController

    useEffect(() => {
        return () => {
            setErrorMsg('');
        };
    }, []);


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