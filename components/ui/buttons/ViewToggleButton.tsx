import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type ViewMode = 'card' | 'list';

interface ViewToggleButtonProps {
  currentMode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

export default function ViewToggleButton({ currentMode, onToggle }: ViewToggleButtonProps) {
  return (
    <View className="flex-row bg-gray-100 rounded-lg overflow-hidden absolute right-5">
      <TouchableOpacity
        className={`px-4 py-2 ${currentMode === 'card' ? 'bg-primary' : 'bg-transparent'}`}
        onPress={() => onToggle('card')}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons 
          name="grid" 
          size={20} 
          color={currentMode === 'card' ? 'white' : 'gray'} 
        />
      </TouchableOpacity>
      
      <TouchableOpacity
        className={`px-4 py-2 ${currentMode === 'list' ? 'bg-primary' : 'bg-transparent'}`}
        onPress={() => onToggle('list')}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons 
          name="list" 
          size={20} 
          color={currentMode === 'list' ? 'white' : 'gray'} 
        />
      </TouchableOpacity>
    </View>
  );
} 