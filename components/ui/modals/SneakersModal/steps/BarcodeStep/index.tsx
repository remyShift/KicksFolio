import { View, Text, StyleSheet } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { useModalStore } from '@/store/useModalStore';
import { useSneakerAPI } from '../../hooks/useSneakerAPI';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import Ionicons from '@expo/vector-icons/Ionicons';
import useToast from '@/hooks/useToast';

export const BarcodeStep = () => {
    const { t } = useTranslation();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const {
        setFetchedSneaker,
        setModalStep,
        setErrorMsg,
        errorMsg,
        setSneakerSKU
    } = useModalStore();

    const { handleBarcodeSearch } = useSneakerAPI();
    const { showInfoToast, showSuccessToast } = useToast();

    useEffect(() => {
        const getCameraPermissions = async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        };

        getCameraPermissions();
        setErrorMsg('');
    }, [setErrorMsg]);

    const handleBarcodeScanned = ({ data }: { data: string }) => {
        if (scanned || isLoading) return;
        
        setScanned(true);
        setSneakerSKU(data);
        setErrorMsg('');
        
        showInfoToast(
            t('collection.messages.searching.title'),
            t('collection.messages.searching.description')
        );
        
        setIsLoading(true);
        
        handleBarcodeSearch(data, {
            setFetchedSneaker,
            setModalStep,
            setErrorMsg
        })
            .then(() => {
                showSuccessToast(
                    t('collection.messages.found.title'),
                    t('collection.messages.found.description')
                );
            })
            .finally(() => {
                setIsLoading(false);
                setScanned(false);
            });
    };

    if (hasPermission === null) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="font-open-sans-bold text-lg">
                    {t('collection.modal.barcode.requesting')}
                </Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View className="flex-1 justify-center items-center gap-4">
                <Text className="font-open-sans-bold text-lg text-center px-6">
                    {t('collection.modal.barcode.noPermission')}
                </Text>
                <Text className="font-open-sans-bold text-sm text-center px-6">
                    {t('collection.modal.barcode.enablePermission')}
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 relative">
            {isLoading ? (
                <View className="flex-1 bg-gray-200 items-center justify-center">
                    <Ionicons name="search" size={40} color="#6B7280" />
                    <Text className="font-open-sans-bold text-gray-600 mt-2 text-center">
                        {t('collection.messages.searching.title')}
                    </Text>
                </View>
            ) : (
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    zoom={0.2}
                    barcodeScannerSettings={{
                        barcodeTypes: ['upc_a', 'upc_e', 'ean13', 'ean8', 'code128'],
                    }}
                    onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                />
            )}

            <View className="absolute top-0 left-0 right-0 p-4 z-10">
                <View className="bg-blue-50/90 p-2 rounded-lg border border-blue-200 flex-row items-center ">
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                    <Text className="ml-2 text-sm text-blue-700 flex-1 text-center">
                        {t('collection.modal.barcode.description')}
                    </Text>
                </View>
                
                {errorMsg && (
                    <View className="mt-2">
                        <ErrorMsg content={errorMsg} display={!!errorMsg} />
                    </View>
                )}
            </View>

            <View className="absolute inset-0 items-center justify-center z-10 top-0 left-0 right-0 bottom-0">
                <View className="relative">
                    <View 
                        className="border-2 border-white rounded-lg"
                        style={{
                            width: 280,
                            height: 160,
                            backgroundColor: 'transparent',
                        }}
                    >
                        <View className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-lg" />
                        <View className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-lg" />
                        <View className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-lg" />
                        <View className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-lg" />
                    </View>

                    <View className="absolute -bottom-16 left-0 right-0">
                        <Text className="font-open-sans-bold text-white text-center bg-black/50 px-4 py-2 rounded-lg">
                            {isLoading ? 
                                t('collection.messages.searching.description') : 
                                t('collection.modal.barcode.instruction')
                            }
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}; 