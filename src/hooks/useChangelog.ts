import { useCallback, useEffect, useState } from 'react';

import Constants from 'expo-constants';

import { getCurrentVersionChangelog } from '@/config/changelogs';
import { VersionChangelog } from '@/types/changelog';

import { useStorageState } from './useStorageState';

const CHANGELOG_STORAGE_KEY = 'lastSeenChangelogVersion';

interface UseChangelogReturn {
	currentChangelog: VersionChangelog | undefined;
	shouldShowChangelog: boolean;
	isVisible: boolean;
	showChangelog: () => void;
	hideChangelog: () => void;
	appVersion: string;
}

export function useChangelog(): UseChangelogReturn {
	const appVersion = Constants.expoConfig?.version || '1.0.0';
	const [[isLoading, lastSeenVersion], setLastSeenVersion] = useStorageState(
		CHANGELOG_STORAGE_KEY
	);

	const [isVisible, setIsVisible] = useState(false);

	const currentChangelog = getCurrentVersionChangelog(appVersion);
	const shouldShowChangelog =
		!isLoading && lastSeenVersion !== appVersion && !!currentChangelog;

	useEffect(() => {
		if (shouldShowChangelog) {
			setIsVisible(true);
		}
	}, [shouldShowChangelog]);

	const showChangelog = useCallback(() => {
		setIsVisible(true);
	}, []);

	const hideChangelog = useCallback(() => {
		setIsVisible(false);
		setLastSeenVersion(appVersion);
	}, [appVersion, setLastSeenVersion]);

	return {
		currentChangelog,
		shouldShowChangelog,
		isVisible,
		showChangelog,
		hideChangelog,
		appVersion,
	};
}
