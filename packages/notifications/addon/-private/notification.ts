import { tracked } from '@glimmer/tracking';
import Timer from './timer';
import { NotificationOptions, CustomAction } from './types';
import { getConfigOption } from './get-config';

export default class Notification {
  readonly message: string;
  readonly transitionDuration: number;
  readonly appearance: NonNullable<NotificationOptions['appearance']>;
  readonly customActions?: CustomAction[];
  readonly allowClosing: boolean;
  readonly duration: number;
  readonly id?: string;

  @tracked timer?: Timer;
  @tracked isRemoving = false;

  constructor(message: string, options: NotificationOptions = {}) {
    this.message = message;
    this.appearance =
      options.appearance || getConfigOption('appearance', 'info');
    this.customActions = options.customActions;
    this.duration = options.duration || getConfigOption('duration', 5000);
    this.transitionDuration =
      typeof options.transitionDuration !== 'undefined'
        ? options.transitionDuration
        : getConfigOption('transitionDuration', 200);

    if (options.allowClosing === false) {
      this.allowClosing = false;
    } else {
      this.allowClosing = true;
    }

    this.id = options.id;
  }

  remove(): void {
    this.isRemoving = true;

    if (this.timer) {
      this.timer.clear();
    }
  }
}
