import { View, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native';
import { ImageUploader } from '../FormStep/components/ImageUploader';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useRef, useEffect } from 'react';
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
    
    const { currentSneaker, sneakerToAdd, setSneakerToAdd, setValidateForm, setClearFormErrors } = useModalStore();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        getFieldError,
        hasFieldError,
        reset,
        formState: { isValid }
    } = useFormController<SneakerFormData>({
        schema: sneakerSchema,
        defaultValues: {
            model: currentSneaker?.model || '',
            brand: currentSneaker?.brand || '',
            status: currentSneaker?.status || '',
            size: currentSneaker?.size ? String(currentSneaker.size) : '',
            condition: currentSneaker?.condition ? String(currentSneaker.condition) : '',
            pricePaid: currentSneaker?.price_paid ? String(currentSneaker.price_paid) : '',
            description: currentSneaker?.description || '',
        },
        onSubmit: async (data) => {
            setSneakerToAdd({
                model: data.model,
                brand: data.brand,
                status: data.status,
                size: data.size,
                condition: data.condition,
                price_paid: data.pricePaid || '',
                description: data.description || '',
                images: currentSneaker?.images || [],
            } as any);
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
                pricePaid: currentSneaker.price_paid?.toString() || '',
                description: currentSneaker.description || '',
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

    useEffect(() => {
        const handleValidateAndSubmit = async () => {
            const result = await new Promise<{ isValid: boolean; errorMsg: string }>((resolve) => {
                handleFormSubmit();
                resolve({ isValid, errorMsg: '' });
            });
            return result;
        };

        const clearFormErrors = () => {
            reset();
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
        getFieldError('pricePaid') || 
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
                    <ImageUploader
                        image={currentSneaker?.images?.[0]?.url || ''}
                        setImage={(uri) => {
                            setSneakerToAdd({
                                ...sneakerToAdd,
                                images: [{ url: uri }, ...(currentSneaker?.images?.slice(1) || [])],
                            } as any);
                        }}
                        isError={false}
                        isFocused={false}
                        setIsError={() => {}}
                    />

                    {displayedError && <ErrorMsg content={displayedError} display={true} />}

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
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}; 