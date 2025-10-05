import { useCallback, useEffect, useState } from 'react';

import Constants from 'expo-constants';

import { getCurrentVersionChangelog } from '@/config/changelogs';
import { VersionChangelog } from '@/types/changelog';

import { useStorageState } from './useStorageState';

const CHANGELOG_STORAGE_KEY = 'lastSeenChangelogVersion';

interface UseChangelogReturn {
	currentChangelog: VersionChangelog | undefined;
	shouldShowChangelog: boolean;
	isAutoVisible: boolean;
	isManualVisible: boolean;
	showChangelog: () => void;
	hideAutoChangelog: () => void;
	hideManualChangelog: () => void;
	appVersion: string;
}

export function useChangelog(): UseChangelogReturn {
	const appVersion = Constants.expoConfig?.version || '1.0.0';
	const [[isLoading, lastSeenVersion], setLastSeenVersion] = useStorageState(
		CHANGELOG_STORAGE_KEY
	);

	const [isAutoVisible, setIsAutoVisible] = useState(false);
	const [isManualVisible, setIsManualVisible] = useState(false);

	const currentChangelog = getCurrentVersionChangelog(appVersion);
	const shouldShowChangelog =
		!isLoading && lastSeenVersion !== appVersion && !!currentChangelog;

	useEffect(() => {
		if (shouldShowChangelog) {
			setIsAutoVisible(true);
		}
	}, [shouldShowChangelog]);

	const showChangelog = useCallback(() => {
		setIsManualVisible(true);
	}, []);

	const hideAutoChangelog = useCallback(() => {
		setIsAutoVisible(false);
		setLastSeenVersion(appVersion);
	}, [appVersion, setLastSeenVersion]);

	const hideManualChangelog = useCallback(() => {
		setIsManualVisible(false);
	}, []);

	return {
		currentChangelog,
		shouldShowChangelog,
		isAutoVisible,
		isManualVisible,
		showChangelog,
		hideAutoChangelog,
		hideManualChangelog,
		appVersion,
	};
}
