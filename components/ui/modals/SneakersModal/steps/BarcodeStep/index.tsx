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
                <Text className="font-spacemono-bold text-lg">
                    {t('collection.modal.barcode.requesting')}
                </Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View className="flex-1 justify-center items-center gap-4">
                <Text className="font-spacemono-bold text-lg text-center px-6">
                    {t('collection.modal.barcode.noPermission')}
                </Text>
                <Text className="font-spacemono-bold text-sm text-center px-6">
                    {t('collection.modal.barcode.enablePermission')}
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 gap-2">
            <View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <View className="flex-row items-center">
                    <Ionicons name="information-circle" size={20} color="#3B82F6" />
                    <Text className="ml-2 text-sm text-blue-700 flex-1 text-center">
                        {t('collection.modal.barcode.description')}
                    </Text>
                </View>
            </View>

            <View className="flex items-center justify-center gap-2">
                <ErrorMsg content={errorMsg} display={!!errorMsg} />
                
                {isLoading ? (
                    <View className="flex items-center justify-center" style={{ width: '80%', height: '40%' }}>
                        <View className="bg-gray-200 rounded-lg flex-1 w-full items-center justify-center">
                            <Ionicons name="search" size={40} color="#6B7280" />
                            <Text className="font-spacemono-bold text-gray-600 mt-2 text-center">
                                {t('collection.messages.searching.title')}
                            </Text>
                        </View>
                    </View>
                ) : (
                    <CameraView
                        style={{
                            width: '80%',
                            height: '40%',
                        }}
                        zoom={0.4}
                        barcodeScannerSettings={{
                            barcodeTypes: ['upc_a', 'upc_e', 'ean13', 'ean8', 'code128'],
                        }}
                        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                    />
                )}
                
                <View className="flex justify-center items-center">
                    <Text className="font-spacemono-bold text-center mt-4 px-6">
                        {isLoading ? 
                            t('collection.messages.searching.description') : 
                            t('collection.modal.barcode.instruction')
                        }
                    </Text>
                </View>
            </View>
        </View>
    );
}; 