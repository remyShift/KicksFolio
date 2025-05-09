import { View, Text, Pressable } from 'react-native';
import { ModalStep } from '../../types';

interface InitialStepProps {
    setModalStep: (step: ModalStep) => void;
    closeModal: () => void;
    userSneakersLength?: number;
}

export const InitialStep = ({ setModalStep, closeModal, userSneakersLength = 0 }: InitialStepProps) => {
    const indexTitle = userSneakersLength === 0 ? 'Add your first sneaker' : 'Add a new sneaker';

    return (
        <View className="flex-1 justify-center items-center gap-8">
            <Text className="font-actonia text-primary text-4xl text-center">{indexTitle}</Text>
            <Text className="font-spacemono-bold text-xl text-center">How do you want to proceed ?</Text>
            <View className="flex justify-center items-center gap-12">
                <View className="flex-col justify-center items-center gap-1 px-6">
                    <Pressable
                        onPress={() => setModalStep('box')}
                    >
                        <Text className="font-spacemono-bold text-lg text-center text-primary">
                            Scan your sneaker box barcode
                        </Text>
                    </Pressable>
                    <Text className="font-spacemono-bold text-sm text-center">
                        Can make mistakes and not always accurate.
                    </Text>
                </View>
                <View className="flex-col justify-center items-center gap-1 px-6">
                    <Pressable
                        onPress={() => setModalStep('sku')}
                    >
                        <Text className="font-spacemono-bold text-lg text-center text-primary">
                            By sneakers SKU
                        </Text>
                    </Pressable>
                    <Text className="font-spacemono-bold text-sm text-center">
                        You can find the SKU on the sneaker box or on the sneaker itself.
                    </Text>
                </View>
                <View className="flex-col justify-center items-center gap-1 px-6">
                    <Pressable
                        onPress={() => setModalStep('noBox')}
                    >
                        <Text className="font-spacemono-bold text-lg text-center text-primary">
                            Add manually
                        </Text>
                    </Pressable>
                    <Text className="font-spacemono-bold text-sm text-center">
                        You do it by yourself.
                    </Text>
                </View>
            </View>
        </View>
    );
};
