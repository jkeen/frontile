import Component from '@glimmer/component';
import { action } from '@ember/object';
import { buildWaiter } from '@ember/test-waiters';
import safeStyles from '@frontile/core/utils/safe-styles';

const waiter = buildWaiter('@frontile/core:collapsible');

export interface CollapsibleArgs {
  /**
   * If true, the content will be visible
   */
  isOpen: boolean;

  /**
   * The height for the content in it's collapsed state.
   * The unit of the value should be included, eg. '10px'.
   *
   * @defaultValue 0
   */
  initialHeight?: string;
}

export interface CollapsibleSignature {
  Args: CollapsibleArgs;
  Element: HTMLDivElement;
}

export default class Collapsible extends Component<CollapsibleSignature> {
  isInitiallyOpen = false;
  waiterToken?: unknown;
  isCurrentlyOpen = false; // Internal value to track if open or not

  constructor(owner: unknown, args: CollapsibleArgs) {
    super(owner, args);

    if (this.args.isOpen) {
      this.isInitiallyOpen = true;
      this.isCurrentlyOpen = true;
    }
  }

  get styles(): ReturnType<typeof safeStyles> {
    let styles: Record<string, string | number> = {};

    if (!this.isInitiallyOpen) {
      styles = {
        ...styles,
        height: this.args.initialHeight || 0,
        opacity: this.args.initialHeight ? '1' : '0'
      };
    }

    if (this.args.initialHeight || !this.isInitiallyOpen) {
      styles = {
        ...styles,
        overflow: 'hidden'
      };
    }

    return safeStyles(styles);
  }

  @action update(element: HTMLElement, [isOpen]: boolean[]): void {
    if (this.isCurrentlyOpen !== !!isOpen) {
      this.waiterToken = waiter.beginAsync();
    }

    if (isOpen) {
      this.expand(element);
    } else {
      this.contract(element);
    }
  }

  @action onTransitionEnd(event: TransitionEvent): void {
    if (
      (event.propertyName === 'height' || event.propertyName == 'opacity') &&
      this.args.isOpen
    ) {
      (event.target as HTMLElement).style.height = 'auto';
      (event.target as HTMLElement).style.overflow = '';
    }
    if (this.waiterToken) {
      // when is opened, wait for height transition to finish
      // when is opened, wait for opacity transition to finish at 1
      // when closed, wait for opacity transition to finish at 0
      // when closed and has initialHeight, wait for height transition to finish
      if (
        (this.args.isOpen && event.propertyName === 'height') ||
        (!this.args.isOpen &&
          event.propertyName === 'opacity' &&
          (event.target as HTMLElement).style.opacity == '0') ||
        (this.args.isOpen &&
          event.propertyName === 'opacity' &&
          (event.target as HTMLElement).style.opacity == '1') ||
        (!this.args.isOpen &&
          this.args.initialHeight &&
          event.propertyName === 'height')
      ) {
        waiter.endAsync(this.waiterToken);
      }
    }
  }

  heightTransition(duration: number): string {
    return `height ${duration}s cubic-bezier(0.4, 0, 0.2, 1) 0ms`;
  }

  opacityTransition(duration: number): string {
    return `opacity ${duration}s ease-in-out 0ms`;
  }

  expand(element: HTMLElement): void {
    this.isCurrentlyOpen = true;
    element.style.transition = [
      this.heightTransition(0.4),
      this.opacityTransition(0.3)
    ].join(', ');
    element.style.overflow = 'hidden';

    const height = element.scrollHeight;
    window.requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.height = `${height}px`;
    });
  }

  contract(element: HTMLElement): void {
    this.isCurrentlyOpen = false;
    const height = element.scrollHeight;
    element.style.transition = '';
    element.style.overflow = 'hidden';

    window.requestAnimationFrame(() => {
      element.style.height = `${height}px`;
      element.style.transition = [
        this.heightTransition(0.2),
        this.opacityTransition(0.3)
      ].join(', ');

      window.requestAnimationFrame(() => {
        if (!this.args.initialHeight) {
          element.style.opacity = '0';
        }
        element.style.height = this.args.initialHeight || '0';
      });
    });
  }
}
