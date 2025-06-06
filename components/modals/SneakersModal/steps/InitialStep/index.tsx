import { View, Text, Pressable } from 'react-native';
import { useModalStore } from '@/store/useModalStore';

interface InitialStepProps {
    userSneakersLength?: number;
}

export const InitialStep = ({ userSneakersLength = 0 }: InitialStepProps) => {
    const { setModalStep } = useModalStore();
    const indexTitle = userSneakersLength === 0 ? 'Add your first sneaker' : 'Add a new sneaker';

    return (
        <View className="flex-1 justify-center items-center gap-8">
            <Text className="font-actonia text-primary text-4xl text-center">{indexTitle}</Text>
            <Text className="font-spacemono-bold text-xl text-center">How do you want to proceed ?</Text>
            <View className="flex justify-center items-center gap-12">
                <View className="flex-col justify-center items-center gap-1 px-6">
                    <Pressable
                        onPress={() => setModalStep('sku')}
                    >
                        <Text className="font-spacemono-bold text-lg text-center text-primary">
                            By sneakers SKU
                        </Text>
                    </Pressable>
                    <Text className="font-spacemono-bold text-sm text-center">
                        Prefetch the sneaker information from the SKU.
                    </Text>
                </View>
                <View className="flex-col justify-center items-center gap-1 px-6">
                    <Pressable
                        onPress={() => setModalStep('addForm')}
                    >
                        <Text className="font-spacemono-bold text-lg text-center text-primary">
                            Add manually
                        </Text>
                    </Pressable>
                    <Text className="font-spacemono-bold text-sm text-center">
                        You provide yourself the information about the sneaker.
                    </Text>
                </View>
            </View>
        </View>
    );
};
