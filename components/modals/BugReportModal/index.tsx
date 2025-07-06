import React, { useRef } from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useBugReportStore } from '@/store/useBugReportStore';
import { useTranslation } from 'react-i18next';
import MainButton from '@/components/ui/buttons/MainButton';
import BackButton from '@/components/ui/buttons/BackButton';
import { GitHubService } from '@/services/GitHubService';
import useToast from '@/hooks/useToast';
import ErrorMsg from '@/components/ui/text/ErrorMsg';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

export const BugReportModal: React.FC = () => {
    const scrollViewRef = useRef<ScrollView>(null);
	const { t } = useTranslation();
	const { showSuccessToast, showErrorToast } = useToast();
	const {
		isVisible,
		isLoading,
		errorMsg,
		formData,
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
			t('alert.titles.bugReport'),
			t('alert.descriptions.bugReport'),
			[
				{ text: t('alert.choices.cancel'), style: 'cancel' },
				{ 
					text: t('alert.choices.leave'), 
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

	const colorConfig = {
		low: {
			bg: 'bg-green-500',
			border: 'border-green-500',
			text: 'text-white'
		},
		medium: {
			bg: 'bg-yellow-500',
			border: 'border-yellow-500',
			text: 'text-white'
		},
		high: {
			bg: 'bg-red-500',
			border: 'border-red-500',
			text: 'text-white'
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
				<View className="flex-row items-center justify-between p-4 border-b border-gray-200">
					<BackButton onPressAction={handleClose} />
					<Text className="text-xl font-bold text-gray-900">
						{t('bugReport.modal.title')}
					</Text>
					<View className="w-8" />
				</View>

				{/* Info Box */}
				<View className="bg-blue-50 p-4 rounded-b-lg border border-blue-200">
					<View className="flex-row items-start">
						<Ionicons name="information-circle" size={20} color="#3B82F6" />
						<Text className="ml-2 text-sm text-blue-700 flex-1">
							{t('bugReport.modal.infoText')}
						</Text>
					</View>
				</View>

				{/* Form */}
				<KeyboardAwareScrollView
					ref={scrollViewRef}
					className='flex-1'
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={{ flexGrow: 1, padding: 8 }}
					bottomOffset={10}
				>
					<View className="flex flex-col gap-6 px-4">
						{/* Title */}
						<View>
							<Text className="text-base font-medium text-gray-700 mb-2">
								{t('bugReport.fields.title.label')}
							</Text>
							<TextInput
								placeholder={t('bugReport.fields.title.placeholder')}
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
								{t('bugReport.fields.description.label')}
							</Text>
							<TextInput
								placeholder={t('bugReport.fields.description.placeholder')}
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
								{t('bugReport.fields.stepsToReproduce.label')}
							</Text>
							<TextInput
								placeholder={t('bugReport.fields.stepsToReproduce.placeholder')}
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
								{t('bugReport.fields.expectedBehavior.label')}
							</Text>
							<TextInput
								placeholder={t('bugReport.fields.expectedBehavior.placeholder')}
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
								{t('bugReport.fields.actualBehavior.label')}
							</Text>
							<TextInput
								placeholder={t('bugReport.fields.actualBehavior.placeholder')}
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

						{/* Priority Selection */}
						<View className="mb-4">
							<Text className="text-lg font-semibold mb-2 text-gray-800">
								{t('bugReport.fields.priority.label')}
							</Text>
							<View className="flex-row gap-4">
								{priorityOptions.map((option) => {
									const isSelected = formData.priority === option.value;
									const colors = colorConfig[option.value as keyof typeof colorConfig];
									
									const buttonClasses = isSelected
										? `${colors.bg} ${colors.border}`
										: 'bg-white border-gray-300';
									
									const textClasses = isSelected
										? colors.text
										: 'text-gray-700';

									return (
										<TouchableOpacity
											key={option.value}
											onPress={() => updateFormData({ priority: option.value as 'low' | 'medium' | 'high' })}
											className={`px-4 py-2 rounded-md border ${buttonClasses}`}
											testID={`priority-${option.value}`}
										>
											<Text className={`text-base ${textClasses}`}>
												{option.label}
											</Text>
										</TouchableOpacity>
									);
								})}
							</View>
						</View>

						{/* Error Message */}
						{errorMsg && (
							<ErrorMsg content={errorMsg} display={true} />
						)}

						<View className="flex flex-row justify-center mb-6">
							<MainButton
								content={t('bugReport.modal.button')}
								onPressAction={handleSubmit}
								isDisabled={isLoading}
								backgroundColor="bg-primary"
							/>
						</View>
					</View>
				</KeyboardAwareScrollView>
			</View>
		</Modal>
	);
}; 