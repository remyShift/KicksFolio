import { View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/Sneaker';
import { ImageUploader } from './components/ImageUploader';
import { FormFields } from './components/FormFields';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useState, useRef, useEffect } from 'react';
import { useModalStore } from '@/store/useModalStore';
import { SneakerFormData } from '../../types';

interface FormStepProps {
    sneaker: Sneaker | null;
    setSneaker: (sneaker: Sneaker | null) => void;
    userSneakers: Sneaker[] | null;
    setUserSneakers: (sneakers: Sneaker[] | null) => void;
}

export const FormStep = ({ 
    sneaker, 
    setSneaker,
    userSneakers,
    setUserSneakers
}: FormStepProps) => {
    const { user, sessionToken } = useSession();
    const { setModalStep } = useModalStore();
    const scrollViewRef = useRef<ScrollView>(null);
    const [errorMsg, setErrorMsg] = useState('');
    
    const [sneakerName, setSneakerName] = useState(sneaker?.model || '');
    const [sneakerBrand, setSneakerBrand] = useState(sneaker?.brand || '');
    const [sneakerStatus, setSneakerStatus] = useState(sneaker?.status || '');
    const [sneakerSize, setSneakerSize] = useState(sneaker?.size?.toString() || '');
    const [sneakerCondition, setSneakerCondition] = useState(sneaker?.condition?.toString() || '');
    const [sneakerImage, setSneakerImage] = useState(sneaker?.images?.[0]?.url || '');
    const [sneakerPricePaid, setSneakerPricePaid] = useState(sneaker?.price_paid?.toString() || '');
    const [sneakerDescription, setSneakerDescription] = useState(sneaker?.description || '');

    useEffect(() => {
        if (sneaker) {
            setSneakerName(sneaker.model || '');
            setSneakerBrand(sneaker.brand || '');
            setSneakerStatus(sneaker.status || '');
            setSneakerSize(sneaker.size?.toString() || '');
            setSneakerCondition(sneaker.condition?.toString() || '');
            setSneakerImage(sneaker.images?.[0]?.url || '');
            setSneakerPricePaid(sneaker.price_paid?.toString() || '');
            setSneakerDescription(sneaker.description || '');
        }
    }, [sneaker]);

    const { handleFormSubmit } = useSneakerAPI(sessionToken || null, user?.collection?.id);

    const currentSneakerId = userSneakers ? userSneakers.find((s: Sneaker) => s.id === sneaker?.id)?.id : null;

    const handleSubmit = () => {
        const formData: SneakerFormData = {
            model: sneakerName,
            brand: sneakerBrand,
            status: sneakerStatus,
            size: sneakerSize,
            condition: sneakerCondition,
            images: sneakerImage ? [{ url: sneakerImage }] : [],
            price_paid: sneakerPricePaid,
            description: sneakerDescription
        };

        handleFormSubmit(
            formData,
            user?.id!,
            currentSneakerId || undefined,
            userSneakers,
            {
                setUserSneakers,
                setSneaker,
                setModalStep,
                setErrorMsg
            }
        );
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
                <View className="flex-1 h-full p-2 gap-2">
                    <ImageUploader
                        image={sneakerImage}
                        setImage={setSneakerImage}
                        isError={false}
                        isFocused={false}
                        setIsError={() => {}}
                    />

                    {errorMsg && <ErrorMsg content={errorMsg} display={true} />}

                    <FormFields
                        scrollViewRef={scrollViewRef}
                        onSneakerNameChange={setSneakerName}
                        onSneakerBrandChange={setSneakerBrand}
                        onSneakerStatusChange={setSneakerStatus}
                        onSneakerSizeChange={setSneakerSize}
                        onSneakerPricePaidChange={setSneakerPricePaid}
                        onSneakerConditionChange={setSneakerCondition}
                        onSneakerDescriptionChange={setSneakerDescription}
                        onErrorChange={(field, error) => setErrorMsg(error)}
                        initialValues={{
                            sneakerName,
                            sneakerBrand,
                            sneakerStatus,
                            sneakerSize,
                            sneakerPricePaid,
                            sneakerCondition,
                            sneakerDescription
                        }}
                    />
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};