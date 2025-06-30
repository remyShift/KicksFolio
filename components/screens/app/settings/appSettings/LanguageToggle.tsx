import Toggle from '@/components/ui/buttons/Toggle';

interface LanguageToggleProps {
    onToggle: (newLanguage: 'en' | 'fr') => void;
    currentLanguage: 'en' | 'fr';
}

export default function LanguageToggle({ onToggle, currentLanguage }: LanguageToggleProps) {
    const handleToggle = (newValue: string) => {
        onToggle(newValue as 'en' | 'fr');
    };

    return (
        <Toggle
            leftValue="en"
            rightValue="fr"
            currentValue={currentLanguage}
            onToggle={handleToggle}
            testID="language-toggle"
        />
    );
} 