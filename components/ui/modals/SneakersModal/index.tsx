import { View } from 'react-native';
import { ModalFooter } from './shared/ModalFooter';
import { InitialStep } from './steps/InitialStep';
import { SkuStep } from './steps/SkuStep';
import { BarcodeStep } from './steps/BarcodeStep';
import { FormImageStep } from './steps/FormImageStep';
import { FormDetailsStep } from './steps/FormDetailsStep';
import { EditFormStep } from './steps/EditFormStep';
import { ViewStep } from './steps/ViewStep';
import { useModalStore } from '@/store/useModalStore';

export const SneakersModal = () => {
    const { 
        modalStep, 
        isVisible,
        currentSneaker
    } = useModalStore();

    if (!isVisible) return null;

    return (
        <View className="flex-1" testID="sneakers-modal">
            <View className="flex-1">
                {modalStep === 'index' && (
                    <InitialStep />
                )}

                {modalStep === 'sku' && (
                    <SkuStep />
                )}

                {modalStep === 'barcode' && (
                    <BarcodeStep />
                )}

                {modalStep === 'addFormImages' && (
                    <FormImageStep />
                )}

                {modalStep === 'addFormDetails' && (
                    <FormDetailsStep />
                )}

                {modalStep === 'editFormImages' && (
                    <FormImageStep />
                )}

                {modalStep === 'editForm' && (
                    <EditFormStep />
                )}

                {modalStep === 'view' && currentSneaker && (
                    <ViewStep/>
                )}
            </View>

            <ModalFooter />
        </View>
    );
};
