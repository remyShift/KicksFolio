import { Platform, View, KeyboardAvoidingView, Text } from 'react-native';
import { useSession } from '@/context/authContext';
import { useModalStore } from '@/store/useModalStore';
import SkuInput from './SkuInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useEffect } from 'react';
import { Link } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useForm } from 'react-hook-form';

interface SkuFormValues {
    sku: string;
}

export const SkuStep = () => {
    const { user } = useSession();
    const { control, handleSubmit, watch } = useForm<SkuFormValues>({
        defaultValues: {
            sku: ''
        }
    });

    const {
        setSneakerSKU, 
        errorMsg, 
        setErrorMsg,
        setFetchedSneaker,
        setModalStep,
    } = useModalStore();

    const { handleSkuSearch } = useSneakerAPI(user!.id);

    useEffect(() => {
        setErrorMsg('');
    }, [setErrorMsg]);

    useEffect(() => {
        const subscription = watch((value) => {
            if (value.sku) {
                setSneakerSKU(value.sku);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, setSneakerSKU]);

    const onSubmit = (data: SkuFormValues) => {
        setSneakerSKU(data.sku);
        handleSkuSearch(data.sku, {
            setFetchedSneaker,
            setModalStep,
            setErrorMsg
        });
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
                        name="sku"
                        control={control}
                        placeholder="CJ5482-100"
                        onSubmitEditing={handleSubmit(onSubmit)}
                    />
                </View>

                <Text className="font-spacemono-bold text-sm text-center px-6">
                    NB : For Nike sneakers dont forget the "-" and the 3 numbers following it or it will not work.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
};
