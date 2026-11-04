import { BaseAppArgs } from '../../common';
import { QwikAnswer } from './prompts';

export type QwikArgs = BaseAppArgs & Partial<QwikAnswer>;
