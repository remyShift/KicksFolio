import { View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { ImageUploader } from '../FormStep/components/ImageUploader';
import { FormFields } from '../FormStep/components/FormFields';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useState, useRef, useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { SneakerFormData } from '@/components/modals/SneakersModal/types';
import { useSneakerFormValidation } from '@/hooks/useSneakerFormValidation';

export const EditFormStep = () => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [displayErrorMsg, setDisplayErrorMsg] = useState('');
    const [isSneakerNameError, setIsSneakerNameError] = useState(false);
    const [isSneakerBrandError, setIsSneakerBrandError] = useState(false);
    const [isSneakerStatusError, setIsSneakerStatusError] = useState(false);
    const [isSneakerSizeError, setIsSneakerSizeError] = useState(false);
    const [isSneakerConditionError, setIsSneakerConditionError] = useState(false);
    
    const { currentSneaker, sneakerToAdd, setSneakerToAdd, errorMsg, setValidateForm, setClearFormErrors } = useModalStore();
    
    const { validateSneakerForm, globalErrorMsg, clearErrors } = useSneakerFormValidation({
        errorSetters: {
            sneakerName: setIsSneakerNameError,
            sneakerBrand: setIsSneakerBrandError,
            sneakerStatus: setIsSneakerStatusError,
            sneakerSize: setIsSneakerSizeError,
            sneakerCondition: setIsSneakerConditionError,
        }
    });

    const defaultSneakerToAdd: SneakerFormData = {
        model: '',
        brand: '',
        status: '',
        size: '',
        condition: '',
        images: [],
        price_paid: '',
        description: ''
    };

    // Pré-remplir le formulaire avec les données de la sneaker à éditer
    useEffect(() => {
        if (currentSneaker) {
            setSneakerToAdd({
                model: currentSneaker.model,
                brand: currentSneaker.brand,
                status: currentSneaker.status,
                size: currentSneaker.size.toString(),
                condition: currentSneaker.condition.toString(),
                images: currentSneaker.images || [],
                price_paid: currentSneaker.price_paid?.toString() || '',
                description: currentSneaker.description || ''
            });
        }
    }, [currentSneaker]);

    useEffect(() => {
        setDisplayErrorMsg(errorMsg || globalErrorMsg);
    }, [errorMsg, globalErrorMsg]);

    const handleValidateAndSubmit = async () => {
        const result = await validateSneakerForm([
            { value: sneakerToAdd?.model || '', fieldType: 'sneakerName', isRequired: true },
            { value: sneakerToAdd?.brand || '', fieldType: 'sneakerBrand', isRequired: true },
            { value: sneakerToAdd?.status || '', fieldType: 'sneakerStatus', isRequired: true },
            { value: sneakerToAdd?.size || '', fieldType: 'sneakerSize', isRequired: true },
            { value: sneakerToAdd?.condition || '', fieldType: 'sneakerCondition', isRequired: true },
        ]);

        return result;
    };

    useEffect(() => {
        setValidateForm(handleValidateAndSubmit);
        setClearFormErrors(clearErrors);
        
        return () => {
            setValidateForm(null);
            setClearFormErrors(null);
        };
    }, [sneakerToAdd]);

    // Cleanup au démontage du composant
    useEffect(() => {
        return () => {
            setSneakerToAdd(null);
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
                <View className="flex-1 h-full p-2 gap-2">
                    <ImageUploader
                        image={sneakerToAdd?.images[0]?.url || ''}
                        setImage={(uri) => {
                            setSneakerToAdd({
                                ...defaultSneakerToAdd,
                                ...sneakerToAdd,
                                images: [...(sneakerToAdd?.images || []), { url: uri }],
                            });
                        }}
                        isError={false}
                        isFocused={false}
                        setIsError={() => {}}
                    />

                    {displayErrorMsg && <ErrorMsg content={displayErrorMsg} display={true} />}

                    <FormFields
                        scrollViewRef={scrollViewRef}
                        onSneakerNameChange={(value) => {
                            setSneakerToAdd({
                                ...defaultSneakerToAdd,
                                ...sneakerToAdd,
                                model: value,
                            });
                        }}
                        onSneakerBrandChange={(value) => {
                            setSneakerToAdd({
                                ...defaultSneakerToAdd,
                                ...sneakerToAdd,
                                brand: value,
                            });
                        }}
                        onSneakerStatusChange={(value) => {
                            setSneakerToAdd({
                                ...defaultSneakerToAdd,
                                ...sneakerToAdd,
                                status: value,
                            });
                        }}
                        onSneakerSizeChange={(value) => {
                            setSneakerToAdd({
                                ...defaultSneakerToAdd,
                                ...sneakerToAdd,
                                size: value,
                            });
                        }}
                        onSneakerPricePaidChange={(value) => {
                            setSneakerToAdd({
                                ...defaultSneakerToAdd,
                                ...sneakerToAdd,
                                price_paid: value,
                            });
                        }}
                        onSneakerConditionChange={(value) => {
                            setSneakerToAdd({
                                ...defaultSneakerToAdd,
                                ...sneakerToAdd,
                                condition: value,
                            });
                        }}
                        onSneakerDescriptionChange={(value) => {
                            setSneakerToAdd({
                                ...defaultSneakerToAdd,
                                ...sneakerToAdd,
                                description: value,
                            });
                        }}
                        onErrorChange={(field, error) => setDisplayErrorMsg(error)}
                        initialValues={sneakerToAdd}
                        isSneakerNameError={isSneakerNameError}
                        isSneakerBrandError={isSneakerBrandError}
                        isSneakerStatusError={isSneakerStatusError}
                        isSneakerSizeError={isSneakerSizeError}
                        isSneakerConditionError={isSneakerConditionError}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}; 