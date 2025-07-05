import { useEffect, useCallback } from 'react';
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

const closeModalActions = () => {
    console.log('[SneakersModalWrapper] closeModalActions called');
    try {
        const { setIsVisible, resetModalData } = useModalStore.getState();
        setIsVisible(false);
        resetModalData();
        console.log('[SneakersModalWrapper] closeModalActions completed');
    } catch (error) {
        console.error('[SneakersModalWrapper] closeModalActions error:', error);
    }
};

export default function SneakersModalWrapper() {
    console.log('[SneakersModalWrapper] Component rendering');
    const { isVisible } = useModalStore();
    const translateY = useSharedValue(MODAL_HEIGHT);
    console.log('[SneakersModalWrapper] isVisible:', isVisible);

    const handleCloseModal = useCallback(() => {
        translateY.value = withTiming(MODAL_HEIGHT, {
            duration: 180,
        }, (finished) => {
            if (finished) {
                runOnJS(closeModalActions)();
            }
        });
    }, [translateY]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateY.value = Math.max(0, event.translationY);
        })
        .onEnd((event) => {
            const shouldClose = event.translationY > MODAL_HEIGHT * 0.3 || event.velocityY > 1000;
            
            if (shouldClose) {
                translateY.value = withTiming(MODAL_HEIGHT, {
                    duration: 180,
                }, (finished) => {
                    if (finished) {
                        runOnJS(closeModalActions)();
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
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const overlayStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateY.value,
            [0, MODAL_HEIGHT],
            [0.5, 0],
            Extrapolation.CLAMP
        );

        return {
            opacity,
        };
    });

    useEffect(() => {
        if (isVisible) {
            translateY.value = withTiming(0, {
                duration: 400,
            });
        }
    }, [isVisible]);

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