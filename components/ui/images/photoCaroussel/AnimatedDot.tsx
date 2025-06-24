import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

export type Props = {
  index: number;
  scrollX: SharedValue<number>;
  carouselWidth: number;
};

export const AnimatedDot = ({ index, scrollX, carouselWidth }: Props) => {
  const dotAnimatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * carouselWidth,
      index * carouselWidth,
      (index + 1) * carouselWidth,
    ];
    const scale = interpolate(scrollX.value, inputRange, [1, 1.5, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    const opacity = interpolate(scrollX.value, inputRange, [0.8, 1, 0.8], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    return {
      opacity,
      transform: [{ scale }],
    };
  });

  return (
    <Animated.View 
      className="w-4 h-4 rounded-full bg-white"
      style={dotAnimatedStyle} 
    />
  );
};
