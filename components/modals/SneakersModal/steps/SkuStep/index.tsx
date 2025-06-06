import { ScrollView, Platform, TextInput, View, KeyboardAvoidingView, Text } from 'react-native';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useSession } from '@/context/authContext';
import { useModalStore } from '@/store/useModalStore';
import SkuInput from './SkuInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useState, useRef } from 'react';
import { Sneaker } from '@/types/Sneaker';
import { Link } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';

interface SkuStepProps {
    setSneaker: (sneaker: Sneaker | null) => void;
    setSku: (sku: string) => void;
    errorMsg: string;
}

export const SkuStep = ({ 
    setSneaker,
    setSku,
    errorMsg
}: SkuStepProps) => {
    const { sessionToken } = useSession();
    const { setModalStep, setErrorMsg } = useModalStore();
    const [sneakerSKU, setSneakerSKU] = useState('');
    const skuInputRef = useRef<TextInput>(null);
    const { handleSkuLookup } = useSneakerAPI(sessionToken || null);

    const handleSkuValueChange = (value: string) => {
        setSneakerSKU(value);
        setSku(value);
    };

    const handleSubmit = () => {
        if (!sneakerSKU) {
            setErrorMsg('Please enter a SKU');
            return;
        }

        handleSkuLookup(
            sneakerSKU,
            setSneaker,
            setModalStep,
            setErrorMsg
        );
    };

    return (
        <KeyboardAvoidingView 
            className="flex-1" 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 20}
        >
            <View className="w-full justify-center items-center gap-12 mt-10">
                <View className="flex-row items-center">
                    <Text className="font-spacemono-bold text-xl text-center px-6">
                        Put you sneakers SKU below
                    </Text>
                    <Link href="https://www.wikihow.com/Find-Model-Numbers-on-Nike-Shoes" 
                        className="flex-row justify-center items-center gap-2">
                        <FontAwesome6 name="lightbulb" size={20} color="#F27329" />
                    </Link>
                </View>

                <ErrorMsg content={errorMsg} display={!!errorMsg}/>                                                                                                                                 

                <SkuInput
                    inputRef={skuInputRef}
                    onErrorChange={setErrorMsg}
                    onValueChange={handleSkuValueChange}
                    onSubmit={handleSubmit}
                />

                <Text className="font-spacemono-bold text-sm text-center px-6">
                    NB : For Nike sneakers dont forget the "-" and the 3 numbers following it or it will not work.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};
