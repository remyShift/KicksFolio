import { useEffect } from 'react';
import { Modal, Pressable, View, Dimensions } from 'react-native';
import { SneakersModal } from '@/components/modals/SneakersModal';
import { useModalStore } from '@/store/useModalStore';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';

const { height: screenHeight } = Dimensions.get('window');
const MODAL_HEIGHT = screenHeight * 0.8;

export default function SneakersModalWrapper() {
    const { isVisible, setIsVisible, resetModalData } = useModalStore();
    const translateY = useSharedValue(MODAL_HEIGHT);

    const closeModal = () => {
        resetModalData();
        setIsVisible(false);
    };

    const handleCloseModal = () => {
        translateY.value = withTiming(MODAL_HEIGHT, {
            duration: 180,
        }, (finished) => {
            'worklet';
            if (finished) {
                runOnJS(closeModal)();
            }
        });
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            'worklet';
            const newTranslateY = event.translationY;
            translateY.value = Math.max(0, newTranslateY);
        })
        .onEnd((event) => {
            'worklet';
            const shouldClose = event.translationY > MODAL_HEIGHT * 0.3 || event.velocityY > 1000;
            
            if (shouldClose) {
                translateY.value = withTiming(MODAL_HEIGHT, {
                    duration: 180,
                }, (finished) => {
                    'worklet';
                    if (finished) {
                        runOnJS(closeModal)();
                    }
                });
            } else {
                translateY.value = withSpring(0, {
                    damping: 25,
                    stiffness: 400,
                });
            }
        });

    const modalStyle = useAnimatedStyle(() => {
        'worklet';
        return {
            transform: [{ translateY: translateY.value }],
        };
    }, [translateY]);

    const overlayStyle = useAnimatedStyle(() => {
        'worklet';
        const opacity = interpolate(
            translateY.value,
            [0, MODAL_HEIGHT],
            [0.5, 0],
            Extrapolation.CLAMP
        );

        return {
            opacity,
        };
    }, [translateY]);

    useEffect(() => {
        if (isVisible) {
            translateY.value = withTiming(0, {
                duration: 400,
            });
        } else {
            translateY.value = MODAL_HEIGHT;
        }
    }, [isVisible, translateY]);

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={handleCloseModal}
        >
            <GestureHandlerRootView className="flex-1">
                <Animated.View 
                    className="flex-1 bg-black" 
                    style={overlayStyle}
                >
                    <Pressable 
                        className="flex-1" 
                        onPress={handleCloseModal}
                    />
                </Animated.View>
                
                <Animated.View 
                    className="absolute bottom-0 left-0 right-0"
                    style={[modalStyle, { height: MODAL_HEIGHT }]}
                >
                    <View className="w-full items-center pt-3 pb-2">
                        <View className="w-24 h-1 bg-gray-300 rounded-full" />
                    </View>
                    <GestureDetector gesture={panGesture}>
                        <Animated.View className="flex-1 bg-background rounded-t-3xl">
                            <View className="flex-1 px-4 py-3">
                                <SneakersModal />
                            </View>
                        </Animated.View>
                    </GestureDetector>
                </Animated.View>
                
                <Toast topOffset={60} />
            </GestureHandlerRootView>
        </Modal>
    );
} 