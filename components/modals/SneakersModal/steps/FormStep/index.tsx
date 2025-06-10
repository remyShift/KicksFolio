import { View, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native';
import { ImageUploader } from './components/ImageUploader';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useRef, useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/useFormController';
import { sneakerSchema, SneakerFormData, sneakerStatusOptions, sneakerBrandOptions } from '@/validation/schemas';
import FormTextInput from '@/components/ui/inputs/FormTextInput';
import FormSelectInput from '@/components/ui/inputs/FormSelectInput';

export const FormStep = () => {
    const scrollViewRef = useRef<ScrollView>(null);
    const modelInputRef = useRef<TextInput>(null);
    const brandInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const pricePaidInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    
    const { fetchedSneaker, setFetchedSneaker, sneakerToAdd, setSneakerToAdd, setValidateForm, setClearFormErrors } = useModalStore();

    const {
        control,
        handleFormSubmit,
        handleFieldFocus,
        validateFieldOnBlur,
        getFieldError,
        hasFieldError,
        isSubmitDisabled,
        reset,
        formState: { isValid }
    } = useFormController<SneakerFormData>({
        schema: sneakerSchema,
        defaultValues: {
            model: '',
            brand: '',
            status: '',
            size: '',
            condition: '',
            pricePaid: '',
            description: '',
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
                images: sneakerToAdd?.images || [],
            } as any);
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
                pricePaid: '',
                description: fetchedSneaker.description || '',
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
            } as any);
            
            setFetchedSneaker(null);
        }
    }, [fetchedSneaker, reset]);

    const handleValidateAndSubmit = async () => {
        const result = await new Promise<{ isValid: boolean; errorMsg: string }>((resolve) => {
            handleFormSubmit();
            resolve({ isValid, errorMsg: '' });
        });
        return result;
    };

    useEffect(() => {
        setValidateForm(handleValidateAndSubmit);
        setClearFormErrors(() => {
            reset();
        });
        
        return () => {
            setValidateForm(null);
            setClearFormErrors(null);
        };
    }, [isValid, handleFormSubmit, reset]);

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
                        image={sneakerToAdd?.images?.[0]?.url || ''}
                        setImage={(uri) => {
                            setSneakerToAdd({
                                ...sneakerToAdd,
                                images: [{ url: uri }, ...(sneakerToAdd?.images?.slice(1) || [])],
                            } as any);
                        }}
                        isError={false}
                        isFocused={false}
                        setIsError={() => {}}
                    />

                    {displayedError && <ErrorMsg content={displayedError} display={true} />}

                    <FormTextInput
                        name="model"
                        control={control}
                        label="*Sneaker Model"
                        placeholder="e.g., Air Jordan 1"
                        ref={modelInputRef}
                        nextInputRef={brandInputRef}
                        autoCapitalize="words"
                        onFocus={() => handleFieldFocus('model')}
                        onBlur={async (value) => { await validateFieldOnBlur('model', value); }}
                        error={getFieldErrorWrapper('model')}
                        getFieldError={getFieldErrorWrapper}
                    />

                    <FormSelectInput
                        name="brand"
                        control={control}
                        label="*Brand"
                        placeholder="Select brand"
                        options={sneakerBrandOptions}
                        onFocus={() => handleFieldFocus('brand')}
                        error={getFieldErrorWrapper('brand')}
                    />

                    <FormSelectInput
                        name="status"
                        control={control}
                        label="*Status"
                        placeholder="Select status"
                        options={sneakerStatusOptions}
                        onFocus={() => handleFieldFocus('status')}
                        error={getFieldErrorWrapper('status')}
                    />

                    <FormTextInput
                        name="size"
                        control={control}
                        label="*Size"
                        placeholder="e.g., 42, 9.5"
                        ref={sizeInputRef}
                        nextInputRef={pricePaidInputRef}
                        keyboardType="numeric"
                        onFocus={() => handleFieldFocus('size')}
                        onBlur={async (value) => { await validateFieldOnBlur('size', value); }}
                        error={getFieldErrorWrapper('size')}
                        getFieldError={getFieldErrorWrapper}
                    />

                    <FormTextInput
                        name="condition"
                        control={control}
                        label="*Condition"
                        placeholder="9/10"
                        keyboardType="numeric"
                        onFocus={() => handleFieldFocus('condition')}
                        onBlur={async (value) => { await validateFieldOnBlur('condition', value); }}
                        error={getFieldErrorWrapper('condition')}
                        getFieldError={getFieldErrorWrapper}
                    />

                    <FormTextInput
                        name="pricePaid"
                        control={control}
                        label="Price Paid"
                        placeholder="e.g., 150"
                        ref={pricePaidInputRef}
                        nextInputRef={descriptionInputRef}
                        keyboardType="numeric"
                        onFocus={() => handleFieldFocus('pricePaid')}
                        onBlur={async (value) => { await validateFieldOnBlur('pricePaid', value); }}
                        error={getFieldErrorWrapper('pricePaid')}
                        getFieldError={getFieldErrorWrapper}
                    />

                    <FormTextInput
                        name="description"
                        control={control}
                        label="Description"
                        placeholder="Additional notes..."
                        ref={descriptionInputRef}
                        onFocus={() => handleFieldFocus('description')}
                        onBlur={async (value) => { await validateFieldOnBlur('description', value); }}
                        error={getFieldErrorWrapper('description')}
                        getFieldError={getFieldErrorWrapper}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};