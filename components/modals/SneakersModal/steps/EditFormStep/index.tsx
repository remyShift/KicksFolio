import { ScrollView, TextInput } from 'react-native';
import { useRef, useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/useFormController';
import { createSneakerSchema, SneakerFormData } from '@/validation/schemas';
import { FormFields } from '../../shared/FormFields';
import { useFormValidation } from '../../hooks/useFormValidation';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SneakerStatus } from '@/types/Sneaker';
import { useSizeConversion } from '@/hooks/useSizeConversion';

export const EditFormStep = () => {
    const scrollViewRef = useRef<ScrollView>(null);
    const modelInputRef = useRef<TextInput>(null);
    const brandInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const pricePaidInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    
    const { currentSneaker, sneakerToAdd, setSneakerToAdd, errorMsg } = useModalStore();
    const { getSizeForCurrentUnit } = useSizeConversion();
    
    const displaySize = currentSneaker ? getSizeForCurrentUnit(currentSneaker) : 0;

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
        schema: createSneakerSchema(),
        fieldNames: ['model', 'brand', 'status', 'size', 'condition', 'price_paid', 'images'],
        authErrorMsg: errorMsg,
        defaultValues: {
            model: currentSneaker?.model || '',
            brand: currentSneaker?.brand,
            status: currentSneaker?.status || SneakerStatus.null,
            size: displaySize.toString(),
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
                price_paid: data.price_paid,
                description: data.description || '',
                images: currentSneaker?.images || [],
            } as SneakerFormData);
        },
    });

    useFormValidation(control, watch, reset, trigger, getFieldError);

    useEffect(() => {
        if (currentSneaker) {
            reset({
                model: currentSneaker.model || '',
                brand: currentSneaker.brand || '',
                status: currentSneaker.status || '',
                size: displaySize.toString(),
                condition: currentSneaker.condition.toString() || '',
                price_paid: currentSneaker.price_paid?.toString() || '',
                description: currentSneaker.description || '',
                images: currentSneaker.images || [],
            });
            
            setSneakerToAdd({
                model: currentSneaker.model || '',
                brand: currentSneaker.brand || '',
                status: currentSneaker.status || '',
                size: displaySize.toString(),
                condition: currentSneaker.condition.toString() || '',
                images: currentSneaker.images || [],
                price_paid: currentSneaker.price_paid?.toString() || '',
                description: currentSneaker.description || '',
            } as SneakerFormData);
        }
    }, [currentSneaker, displaySize]);

    useEffect(() => {
        if (currentSneaker?.images && currentSneaker.images.length > 0 && 
            (!sneakerToAdd?.images || sneakerToAdd.images.length === 0)) {
            setSneakerToAdd({
                model: sneakerToAdd?.model || currentSneaker.model || '',
                brand: sneakerToAdd?.brand || currentSneaker.brand || '',
                status: sneakerToAdd?.status || currentSneaker.status || '',
                size: sneakerToAdd?.size || displaySize.toString(),
                condition: sneakerToAdd?.condition || currentSneaker.condition.toString() || '',
                price_paid: sneakerToAdd?.price_paid || currentSneaker.price_paid?.toString() || '',
                description: sneakerToAdd?.description || currentSneaker.description || '',
                images: currentSneaker.images,
            } as SneakerFormData);
        }
    }, [currentSneaker?.images, sneakerToAdd, displaySize]);

    useEffect(() => {
        return () => {
            setSneakerToAdd(null);
        };
    }, []);

    if (!currentSneaker) return null;

    return (
        <KeyboardAwareScrollView
            ref={scrollViewRef}
            className='flex-1'
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, padding: 8 }}
            bottomOffset={10}
        >
            <FormFields
                control={control}
                handleFieldFocus={handleFieldFocus}
                validateFieldOnBlur={validateFieldOnBlur}
                getFieldError={getFieldErrorWrapper}
                modelInputRef={modelInputRef as React.RefObject<TextInput>}
                brandInputRef={brandInputRef as React.RefObject<TextInput>}
                sizeInputRef={sizeInputRef as React.RefObject<TextInput>}
                pricePaidInputRef={pricePaidInputRef as React.RefObject<TextInput>}
                descriptionInputRef={descriptionInputRef as React.RefObject<TextInput>}
                displayedError={displayedError}
                sneakerId={currentSneaker?.id}
            />
        </KeyboardAwareScrollView>
    );
}; 