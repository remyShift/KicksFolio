import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useBugReportStore } from '@/store/useBugReportStore';
import { useTranslation } from 'react-i18next';
import MainButton from '@/components/ui/buttons/MainButton';
import BackButton from '@/components/ui/buttons/BackButton';
import { GitHubService } from '@/services/GitHubService';
import useToast from '@/hooks/useToast';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { Ionicons } from '@expo/vector-icons';

// Les options de priorité seront traduites dynamiquement

export const BugReportModal: React.FC = () => {
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();
	const {
		isVisible,
		isLoading,
		errorMsg,
		formData,
		setIsVisible,
		setIsLoading,
		setErrorMsg,
		updateFormData,
		resetStore,
	} = useBugReportStore();

	const priorityOptions = [
		{ label: t('bugReport.priority.low'), value: 'low' },
		{ label: t('bugReport.priority.medium'), value: 'medium' },
		{ label: t('bugReport.priority.high'), value: 'high' },
	];

	const handleClose = () => {
		Alert.alert(
			t('bugReport.modal.confirmClose.title'),
			t('bugReport.modal.confirmClose.description'),
			[
				{ text: t('ui.buttons.cancel'), style: 'cancel' },
				{ 
					text: t('ui.buttons.close'), 
					style: 'destructive',
					onPress: () => resetStore() 
				},
			]
		);
	};

	const validateForm = (): boolean => {
		setErrorMsg('');
		
		if (!formData.title.trim()) {
			setErrorMsg(t('bugReport.validation.titleRequired'));
			return false;
		}
		
		if (!formData.description.trim()) {
			setErrorMsg(t('bugReport.validation.descriptionRequired'));
			return false;
		}
		
		if (!formData.stepsToReproduce.trim()) {
			setErrorMsg(t('bugReport.validation.stepsRequired'));
			return false;
		}
		
		return true;
	};

	const handleSubmit = async () => {
		if (!validateForm()) return;
		
		setIsLoading(true);
		setErrorMsg('');

		try {
			const result = await GitHubService.createIssue(formData);
			
			showSuccessToast(
				t('bugReport.success.title'),
				t('bugReport.success.description', { number: result.number })
			);
			
			resetStore();
		} catch (error) {
			console.error('Error creating bug report:', error);
			setErrorMsg(t('bugReport.error.createFailed'));
			showErrorToast(
				t('bugReport.error.title'),
				t('bugReport.error.description')
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isVisible) return null;

	return (
		<Modal
			visible={isVisible}
			animationType="slide"
			presentationStyle="pageSheet"
			onRequestClose={handleClose}
		>
			<View className="flex-1 bg-white">
				{/* Header */}
				<View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-gray-200">
					<BackButton onPressAction={handleClose} />
					<Text className="text-xl font-bold text-gray-900">
						{t('bugReport.modal.title')}
					</Text>
					<View className="w-8" />
				</View>

				{/* Form */}
				<ScrollView className="flex-1 px-6 py-4">
					<View className="space-y-4">
						{/* Title */}
						<View>
							<Text className="text-base font-medium text-gray-700 mb-2">
								{t('bugReport.fields.title')} *
							</Text>
							<TextInput
								placeholder={t('bugReport.fields.titlePlaceholder')}
								value={formData.title}
								onChangeText={(text: string) => updateFormData({ title: text })}
								maxLength={100}
								className="bg-white border border-gray-300 rounded-md px-3 py-2 text-base"
								testID="bug-title"
							/>
						</View>

						{/* Description */}
						<View>
							<Text className="text-base font-medium text-gray-700 mb-2">
								{t('bugReport.fields.description')} *
							</Text>
							<TextInput
								placeholder={t('bugReport.fields.descriptionPlaceholder')}
								value={formData.description}
								onChangeText={(text: string) => updateFormData({ description: text })}
								multiline
								numberOfLines={4}
								maxLength={500}
								className="bg-white border border-gray-300 rounded-md px-3 py-2 text-base"
								style={{ height: 100 }}
								textAlignVertical="top"
								testID="bug-description"
							/>
						</View>

						{/* Steps to Reproduce */}
						<View>
							<Text className="text-base font-medium text-gray-700 mb-2">
								{t('bugReport.fields.stepsToReproduce')} *
							</Text>
							<TextInput
								placeholder={t('bugReport.fields.stepsPlaceholder')}
								value={formData.stepsToReproduce}
								onChangeText={(text: string) => updateFormData({ stepsToReproduce: text })}
								multiline
								numberOfLines={4}
								maxLength={500}
								className="bg-white border border-gray-300 rounded-md px-3 py-2 text-base"
								style={{ height: 100 }}
								textAlignVertical="top"
								testID="bug-steps"
							/>
						</View>

						{/* Expected Behavior */}
						<View>
							<Text className="text-base font-medium text-gray-700 mb-2">
								{t('bugReport.fields.expectedBehavior')}
							</Text>
							<TextInput
								placeholder={t('bugReport.fields.expectedPlaceholder')}
								value={formData.expectedBehavior}
								onChangeText={(text: string) => updateFormData({ expectedBehavior: text })}
								multiline
								numberOfLines={3}
								maxLength={300}
								className="bg-white border border-gray-300 rounded-md px-3 py-2 text-base"
								style={{ height: 80 }}
								textAlignVertical="top"
								testID="bug-expected"
							/>
						</View>

						{/* Actual Behavior */}
						<View>
							<Text className="text-base font-medium text-gray-700 mb-2">
								{t('bugReport.fields.actualBehavior')}
							</Text>
							<TextInput
								placeholder={t('bugReport.fields.actualPlaceholder')}
								value={formData.actualBehavior}
								onChangeText={(text: string) => updateFormData({ actualBehavior: text })}
								multiline
								numberOfLines={3}
								maxLength={300}
								className="bg-white border border-gray-300 rounded-md px-3 py-2 text-base"
								style={{ height: 80 }}
								textAlignVertical="top"
								testID="bug-actual"
							/>
						</View>

						{/* Priority */}
						<View>
							<Text className="text-base font-medium text-gray-700 mb-2">
								{t('bugReport.fields.priority')}
							</Text>
							<View className="flex-row space-x-2">
								{priorityOptions.map((option) => (
									<TouchableOpacity
										key={option.value}
										onPress={() => updateFormData({ priority: option.value as 'low' | 'medium' | 'high' })}
										className={`px-4 py-2 rounded-md border ${
											formData.priority === option.value
												? 'bg-blue-500 border-blue-500'
												: 'bg-white border-gray-300'
										}`}
										testID={`priority-${option.value}`}
									>
										<Text className={`text-base ${
											formData.priority === option.value
												? 'text-white'
												: 'text-gray-700'
										}`}>
											{option.label}
										</Text>
									</TouchableOpacity>
								))}
							</View>
						</View>

						{/* Info Box */}
						<View className="bg-blue-50 p-4 rounded-lg border border-blue-200">
							<View className="flex-row items-start">
								<Ionicons name="information-circle" size={20} color="#3B82F6" />
								<Text className="ml-2 text-sm text-blue-700 flex-1">
									{t('bugReport.modal.infoText')}
								</Text>
							</View>
						</View>

						{/* Error Message */}
						{errorMsg && (
							<ErrorMsg content={errorMsg} display={true} />
						)}
					</View>
				</ScrollView>

				{/* Footer */}
				<View className="px-6 py-4 border-t border-gray-200">
					<MainButton
						content={t('bugReport.modal.submitButton')}
						onPressAction={handleSubmit}
						isDisabled={isLoading}
						backgroundColor="bg-blue-500"
					/>
				</View>
			</View>
		</Modal>
	);
}; 