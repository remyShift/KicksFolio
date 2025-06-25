import React from 'react';
import { Modal, Pressable, View, Dimensions } from 'react-native';
import { SneakersModal } from '@/components/modals/SneakersModal';
import { useModalStore } from '@/store/useModalStore';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedGestureHandler,
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
        }, () => {
            runOnJS(closeModal)();
        });
    };

    const gestureHandler = useAnimatedGestureHandler({
        onStart: (_, context: { startY: number }) => {
            context.startY = translateY.value;
        },
        onActive: (event, context: { startY: number }) => {
            const newTranslateY = context.startY + event.translationY;
            translateY.value = Math.max(0, newTranslateY);
        },
        onEnd: (event) => {
            const shouldClose = event.translationY > MODAL_HEIGHT * 0.3 || event.velocityY > 1000;
            
            if (shouldClose) {
                translateY.value = withTiming(MODAL_HEIGHT, {
                    duration: 180,
                }, () => {
                    runOnJS(closeModal)();
                });
            } else {
                translateY.value = withSpring(0, {
                    damping: 25,
                    stiffness: 400,
                });
            }
        },
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

    React.useEffect(() => {
        if (isVisible) {
            translateY.value = withTiming(0, {
                duration: 400,
            });
        } else {
            translateY.value = MODAL_HEIGHT;
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
                    <PanGestureHandler onGestureEvent={gestureHandler}>
                        <Animated.View className="flex-1 bg-background rounded-t-3xl">
                            
                            <View className="flex-1 px-4 py-3">
                                <SneakersModal />
                            </View>
                        </Animated.View>
                    </PanGestureHandler>
                </Animated.View>
            </GestureHandlerRootView>
        </Modal>
    );
} 