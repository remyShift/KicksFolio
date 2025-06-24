import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimatedDot } from './AnimatedDot';
import { Photo } from '@/types/Sneaker';
import { PhotoSlide } from './PhotoSlide';
import { AddPhotoSlide } from './AddPhotoSlide';
import { usePhotoCarousel } from './hooks/usePhotoCarousel';
import { usePhotoEditor } from './hooks/usePhotoEditor';

interface PhotoCarouselProps {
  photos: Photo[];
  height?: number;
  mode?: 'view' | 'edit';
  onPhotosChange?: (photos: Photo[]) => void;
  maxImages?: number;
  sneakerId?: string;
}

export const PhotoCarousel = ({ 
  photos, 
  height = 200, 
  mode = 'view',
  onPhotosChange,
  maxImages = 3,
  sneakerId
}: PhotoCarouselProps) => {
  const {
    scrollX,
    flatListRef,
    carouselWidth,
    setCarouselWidth,
    currentIndex,
    scrollHandler,
    scrollToIndex,
    onAccessibilityAction
  } = usePhotoCarousel(photos);

  const { showImagePicker, removeImage } = usePhotoEditor(
    photos,
    onPhotosChange,
    scrollToIndex,
    currentIndex,
    sneakerId
  );

  if (!photos || photos.length === 0) {
    if (mode === 'edit') {
      return (
        <View 
          style={{ height, width: '100%' }}
          onLayout={event => setCarouselWidth(event.nativeEvent.layout.width)}
        >
          <AddPhotoSlide 
            width={carouselWidth}
            height={height} 
            onPress={() => showImagePicker()} 
          />
        </View>
      );
    }
    return null;
  }

  const displayPhotos = mode === 'edit' && photos.length < maxImages 
    ? [...photos, { id: 'add-photo', uri: '', alt: 'Add photo' } as Photo] 
    : photos;

  const renderItem = ({ item, index }: { item: Photo; index: number }) => {
    if (item.id === 'add-photo') {
      return (
        <AddPhotoSlide 
          width={carouselWidth}
          height={height} 
          onPress={() => showImagePicker()} 
        />
      );
    }

    return (
      <PhotoSlide
        photo={item}
        index={index}
        width={carouselWidth}
        mode={mode}
        onPress={() => showImagePicker(index)}
        onRemove={() => removeImage(index)}
      />
    );
  };

  return (
    <View
      style={{ height }}
      className="items-center justify-center relative w-full"
      onLayout={event => setCarouselWidth(event.nativeEvent.layout.width)}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`Photo carousel, showing photo ${currentIndex + 1} of ${photos.length}. ${photos[currentIndex]?.alt || ''}`}
      accessibilityActions={[
        { name: 'increment', label: 'Next photo' },
        { name: 'decrement', label: 'Previous photo' },
      ]}
      onAccessibilityAction={onAccessibilityAction}
    >
      <View className="w-full rounded-lg">
        <Animated.FlatList
          ref={flatListRef}
          data={displayPhotos}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          accessible={false}
          importantForAccessibility="no-hide-descendants"
        />

        {displayPhotos.length > 1 && (
          <View
            className="absolute bottom-10 left-0 right-0 flex-row justify-center gap-1"
            accessible={false}
          >
            {displayPhotos.map((_, index) => (
              <AnimatedDot
                key={index}
                index={index}
                scrollX={scrollX}
                carouselWidth={carouselWidth}
              />
            ))}
          </View>
        )}
      </View>
      {photos.length > 0 && (
        <View className="absolute top-2 right-2 bg-black/50 rounded-full px-2 py-1">
          <Text className="text-white text-xs font-spacemono">
            {Math.min(currentIndex + 1, photos.length)}/{mode === 'edit' ? maxImages : photos.length}
          </Text>
        </View>
      )}
    </View>
  );
};
