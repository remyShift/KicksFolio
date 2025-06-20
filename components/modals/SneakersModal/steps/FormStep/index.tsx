import { View, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native';
import { useRef, useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/useFormController';
import { sneakerSchema, SneakerFormData } from '@/validation/schemas';
import { FormFields } from '../../shared/FormFields';
import { useFormValidation } from '../../hooks/useFormValidation';

export const FormStep = () => {
    const scrollViewRef = useRef<ScrollView>(null);
    const modelInputRef = useRef<TextInput>(null);
    const brandInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const pricePaidInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    
    const { fetchedSneaker, setFetchedSneaker, sneakerToAdd, setSneakerToAdd, errorMsg, setErrorMsg } = useModalStore();
    
    const {
        control,
        handleFieldFocus,
        validateFieldOnBlur,
        getFieldError,
        reset,
        trigger,
        watch,
        displayedError,
        getFieldErrorWrapper,
    } = useFormController<SneakerFormData>({
        schema: sneakerSchema,
        fieldNames: ['model', 'brand', 'status', 'size', 'condition', 'price_paid', 'images'],
        authErrorMsg: errorMsg,
        defaultValues: {
            model: '',
            brand: 'Other',
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
    
    useFormValidation(control, watch, reset, trigger, getFieldError);

    useEffect(() => {
        if (fetchedSneaker) {
            const imageData = fetchedSneaker.image?.url ? [{ url: fetchedSneaker.image.url }] : [];
            
            reset({
                model: fetchedSneaker.model || '',
                brand: fetchedSneaker.brand || 'Other',
                status: '',
                size: '',
                condition: '',
                price_paid: '',
                description: fetchedSneaker.description || '',
                images: imageData,
            } as SneakerFormData);
            
            setSneakerToAdd({
                model: fetchedSneaker.model || '',
                brand: fetchedSneaker.brand || 'Other',
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

    useEffect(() => {
        return () => {
            setErrorMsg('');
            setSneakerToAdd({
                ...sneakerToAdd,
                images: [],
            } as SneakerFormData);
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