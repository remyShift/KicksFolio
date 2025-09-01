import { View } from 'react-native';

import { useModalStore } from '@/store/useModalStore';

import { ModalFooter } from './shared/ModalFooter';
import { BarcodeStep } from './steps/BarcodeStep';
import { EditFormStep } from './steps/EditFormStep';
import { FormDetailsStep } from './steps/FormDetailsStep';
import { FormImageStep } from './steps/FormImageStep';
import { InitialStep } from './steps/InitialStep';
import { SkuStep } from './steps/SkuStep';
import { ViewStep } from './steps/ViewStep';

export const SneakersModal = () => {
	const modalStep = useModalStore((state) => state.modalStep);
	const isVisible = useModalStore((state) => state.isVisible);
	const currentSneaker = useModalStore((state) => state.currentSneaker);

	if (!isVisible) {
		return null;
	}

	return (
		<View className="flex-1" testID="sneakers-modal">
			<View className="flex-1">
				{modalStep === 'index' && <InitialStep />}

				{modalStep === 'sku' && <SkuStep />}

				{modalStep === 'barcode' && <BarcodeStep />}

				{modalStep === 'addFormImages' && <FormImageStep />}

				{modalStep === 'addFormDetails' && <FormDetailsStep />}

				{modalStep === 'editFormImages' && <FormImageStep />}

				{modalStep === 'editForm' && <EditFormStep />}

				{modalStep === 'view' && currentSneaker && <ViewStep />}
			</View>

			<ModalFooter />
		</View>
	);
};
