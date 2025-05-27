import { View, KeyboardAvoidingView, ScrollView, Platform, TextInput } from 'react-native';
import { ModalStep } from '../../types';
import BackButton from '@/components/ui/buttons/BackButton';
import NextButton from '@/components/ui/buttons/NextButton';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useSession } from '@/context/authContext';
import { Sneaker } from '@/types/Sneaker';
import { useState, useRef } from 'react';
import SkuInput from './SkuInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';

interface SkuStepProps {
    setModalStep: (step: ModalStep) => void;
    closeModal: () => void;
    setSneaker: (sneaker: Sneaker | null) => void;
}

export const SkuStep = ({ setModalStep, closeModal, setSneaker }: SkuStepProps) => {
    const { sessionToken, user } = useSession();
    const { handleSkuLookup } = useSneakerAPI(sessionToken || null);
    const [sneakerSKU, setSneakerSKU] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const skuInputRef = useRef<TextInput>(null);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleNext = async () => {
        if (!sneakerSKU.trim()) {
            setErrorMsg('Please enter a SKU');
            return;
        }

        handleSkuLookup(sneakerSKU, user?.id!)
            .then(data => {
                if (data.results && data.results.length > 0) {
                    const sneakerData = data.results[0];
                    setSneaker(sneakerData);
                    setModalStep('addForm');
                } else {
                    setErrorMsg('No data found for this SKU, check the SKU and try again or add it manually.');
                }
            })
            .catch(error => {
                setErrorMsg('Impossible to find the informations for this SKU. Please check the SKU and try again or add it manually.');
                console.error('Error when fetching SKU data:', error);
            });
    };

    const handleSkuValueChange = (value: string) => {
        setSneakerSKU(value);
    };

    const handleSkuErrorChange = (error: string) => {
        setErrorMsg(error);
    };

    return (
        <View className="flex-1 justify-between items-center gap-8">
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}
                className="flex-1 w-full"
            >
                <ScrollView 
                    ref={scrollViewRef}
                    className="flex-1"
                    keyboardShouldPersistTaps="handled"
                >
                    <ErrorMsg content={errorMsg} display={errorMsg !== ''} />
                    <SkuInput
                        inputRef={skuInputRef}
                        scrollViewRef={scrollViewRef}
                        onErrorChange={handleSkuErrorChange}
                        onValueChange={handleSkuValueChange}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
            <View className="justify-end items-start w-full pb-5">
                <View className="flex-row justify-between w-full">
                    <BackButton 
                        onPressAction={() => setModalStep('index')} 
                    />
                    <NextButton
                        content="Next"
                        onPressAction={handleNext}
                    />
                </View>
            </View>
        </View>
    );
};
