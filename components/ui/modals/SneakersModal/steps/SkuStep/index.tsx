import { View, Text, ScrollView } from 'react-native';
import { useSession } from '@/context/authContext';
import { useModalStore } from '@/store/useModalStore';
import SkuInput from './SkuInput';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { useEffect, useRef } from 'react';
import { Link } from 'expo-router';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useForm } from 'react-hook-form';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useTranslation } from 'react-i18next';

interface SkuFormValues {
    sku: string;
}

export const SkuStep = () => {
    const { t } = useTranslation();
    const { user } = useSession();
    const scrollViewRef = useRef<ScrollView>(null);
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

    const { handleSkuSearch } = useSneakerAPI();

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
        <KeyboardAwareScrollView 
            ref={scrollViewRef}
            className="flex-1" 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1, padding: 8 }}
            bottomOffset={10}
        >
            <View className="w-full justify-center items-center gap-12 mt-10">
                <View className="flex-row items-center">
                    <Text className="font-open-sans-bold text-xl text-center px-6">
                        {t('collection.modal.titles.skuStep')}
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

                <Text className="font-open-sans-bold text-sm text-center px-6">
                    {t('collection.modal.descriptions.skuNote')}
                </Text>
            </View>
        </KeyboardAwareScrollView>
    );
};
