import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';

import { router } from 'expo-router';

import AppleSignInButton from '@/components/screens/auth/oauth/AppleSignInButton';
import GoogleSignInButton from '@/components/screens/auth/oauth/GoogleSignInButton';
import MainButton from '@/components/ui/buttons/MainButton';

interface AuthMethodModalProps {
	visible: boolean;
	onClose: () => void;
	mode: 'login' | 'signup' | null;
}

export default function AuthMethodModal({
	visible,
	onClose,
	mode,
}: AuthMethodModalProps) {
	const { t } = useTranslation();

	const handleEmailAuth = () => {
		onClose();
		if (mode === 'login') {
			router.push('/login');
		} else if (mode === 'signup') {
			router.push('/sign-up');
		}
	};

	const getTitle = () => {
		if (mode === 'login') {
			return t('auth.titles.login');
		} else if (mode === 'signup') {
			return t('auth.titles.signup');
		}
		return '';
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={onClose}
		>
			<View className="flex-1 justify-end bg-black/50">
				<Pressable className="flex-1" onPress={onClose} />

				<View className="bg-white rounded-t-3xl px-6 py-8 max-h-[80%]">
					<View className="flex-row justify-between items-center mb-6">
						<View className="flex-1">
							<Text className="text-2xl font-bold text-gray-900 mb-2">
								{getTitle()}
							</Text>
						</View>

						<Pressable
							onPress={onClose}
							className="w-8 h-8 items-center justify-center"
						>
							<Text className="text-gray-400 text-2xl font-light">
								×
							</Text>
						</Pressable>
					</View>

					<View className="gap-4 mb-6">
						<AppleSignInButton />
						<GoogleSignInButton />
					</View>

					<View className="flex-row items-center gap-4 mb-6">
						<View className="flex-1 h-px bg-gray-300" />
						<Text className="text-gray-500 text-sm">
							{t('auth.oauth.orContinueWith')}
						</Text>
						<View className="flex-1 h-px bg-gray-300" />
					</View>

					<Text
						className="text-primary text-center font-open-sans-bold mb-6"
						onPress={handleEmailAuth}
					>
						{t('auth.buttons.continueWithEmail')}
					</Text>
				</View>
			</View>
		</Modal>
	);
}
