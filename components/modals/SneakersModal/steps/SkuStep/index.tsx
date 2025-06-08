import { Platform, View, KeyboardAvoidingView, Text } from 'react-native';
import { useSession } from '@/context/authContext';
import { useModalStore } from '@/store/useModalStore';
import SkuInput from './SkuInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useEffect } from 'react';
import { Link } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';

export const SkuStep = () => {
    const { sessionToken, user } = useSession();

    const {
        setSneakerSKU, 
        errorMsg, 
        setErrorMsg,
        setModalSessionToken,
        sneakerSKU,
        setFetchedSneaker,
        setModalStep,
    } = useModalStore();

    const { handleSkuSearch } = useSneakerAPI(sessionToken!, user!.id);

    useEffect(() => {
        setModalSessionToken(sessionToken);
    }, [sessionToken, setModalSessionToken]);

    const handleSkuValueChange = (value: string) => {
        setSneakerSKU(value);
        if (errorMsg) {
            setErrorMsg('');
        }
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

                <View className="w-full gap-2">
                    <ErrorMsg content={errorMsg} display={!!errorMsg}/>

                    <SkuInput
                        onErrorChange={setErrorMsg}
                        onValueChange={handleSkuValueChange}
                        onSubmit={() => handleSkuSearch(sneakerSKU, {
                            setFetchedSneaker,
                            setModalStep,
                            setErrorMsg
                        })}
                    />
                </View>

                <Text className="font-spacemono-bold text-sm text-center px-6">
                    NB : For Nike sneakers dont forget the "-" and the 3 numbers following it or it will not work.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};
