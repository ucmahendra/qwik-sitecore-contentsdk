import path from 'path';
import { Initializer, transform } from '../../common';
import { QwikArgs } from './args';
import { QwikAnswer, prompts } from './prompts';
import inquirer from 'inquirer';

export default class QwikInitializer implements Initializer {
  async init(args: QwikArgs) {
    const answers = await inquirer.prompt<QwikAnswer>(prompts, args);
    const templatePath = path.resolve(__dirname, '../../templates/qwik');

    await transform(templatePath, { ...args, ...answers });

    const response = {};
    return response;
  }
}
