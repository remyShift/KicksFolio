import { ShareHandler } from '@/domain/ShareHandler';
import { shareProxy } from '@/tech/proxy/ShareProxy';

export const shareHandler = new ShareHandler(shareProxy);
