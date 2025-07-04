import { ScrollView, TextInput } from 'react-native';
import { useRef, useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { useFormController } from '@/hooks/useFormController';
import { createSneakerSchema, SneakerFormData } from '@/validation/schemas';
import { FormFields } from '../../shared/FormFields';
import { useFormValidation } from '../../hooks/useFormValidation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { Photo } from '@/types/Sneaker';
import { SneakerBrand, SneakerStatus } from '@/types/Sneaker';
import { useTranslation } from 'react-i18next';

export const FormStep = () => {
    const { t } = useTranslation();
    const scrollViewRef = useRef<ScrollView>(null);
    const modelInputRef = useRef<TextInput>(null);
    const brandInputRef = useRef<TextInput>(null);
    const sizeInputRef = useRef<TextInput>(null);
    const pricePaidInputRef = useRef<TextInput>(null);
    const descriptionInputRef = useRef<TextInput>(null);
    
    const { fetchedSneaker, setFetchedSneaker, sneakerToAdd, setSneakerToAdd, errorMsg, setErrorMsg, setEstimatedValue, setGender, setSku } = useModalStore();
    
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
            model: '',
            brand: SneakerBrand.null,
            status: SneakerStatus.null,
            size: '',
            condition: '',
            price_paid: '',
            description: '',
            images: [],
        },
        onSubmit: async (data) => {
            setSneakerToAdd(data);
        },
    });
    
    useFormValidation(control, watch, reset, trigger, getFieldError);

    useEffect(() => {
        if (fetchedSneaker) {
            const imageData: Photo[] = fetchedSneaker.image?.uri ? [{
                id: '',
                uri: fetchedSneaker.image.uri,
                alt: `${fetchedSneaker.model} from SKU search`
            }] : [];
            
            const formData: SneakerFormData = {
                model: fetchedSneaker.model || '',
                brand: fetchedSneaker.brand as SneakerBrand,
                status: SneakerStatus.null,
                size: '',
                condition: '',
                price_paid: '',
                description: fetchedSneaker.description || '',
                images: imageData,
            };
            
            reset(formData);
            setSneakerToAdd(formData);
            setEstimatedValue(fetchedSneaker.estimated_value);
            setGender(fetchedSneaker.gender || null);
            setSku(fetchedSneaker.sku);
            
            setFetchedSneaker(null);
        }
    }, [fetchedSneaker]);

    useEffect(() => {
        return () => {
            setGender(null);
            setSku(null);
            setFetchedSneaker(null);
            setSneakerToAdd(null);
            setEstimatedValue(null);
        };
    }, []);

    useEffect(() => {
        return () => {
            setErrorMsg('');
            if (sneakerToAdd) {
                const resetData: SneakerFormData = {
                    ...sneakerToAdd,
                    status: sneakerToAdd.status as SneakerStatus,
                    images: [],
                };
                setSneakerToAdd(resetData);
            }
        };
    }, []);

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
        </KeyboardAwareScrollView>
    );
};