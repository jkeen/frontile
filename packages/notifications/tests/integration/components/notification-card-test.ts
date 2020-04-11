import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, triggerEvent } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { Notification, NotificationsService } from '@frontile/notifications';
import sinon from 'sinon';

module('Integration | Component | NotificationCard', function (hooks) {
  setupRenderingTest(hooks);

  const template = hbs`
    <NotificationCard
      data-test-notification
      @notification={{this.notification}}
    />`;

  test('it renders the notification content & close button', async function (assert) {
    this.set('notification', new Notification('My message'));

    await render(template);

    assert.dom('[data-test-notification]').containsText('My message');
    assert
      .dom('[data-test-notification] .notification-card__close-btn')
      .containsText('Close');
  });

  test('it renders the correct appearance', async function (assert) {
    this.set('notification', new Notification('My message'));

    await render(template);

    assert.dom('[data-test-notification]').hasClass('notification-card--info');

    this.set(
      'notification',
      new Notification('My message', {
        appearance: 'success'
      })
    );
    assert
      .dom('[data-test-notification]')
      .hasClass('notification-card--success');

    this.set(
      'notification',
      new Notification('My message', {
        appearance: 'warning'
      })
    );
    assert
      .dom('[data-test-notification]')
      .hasClass('notification-card--warning');

    this.set(
      'notification',
      new Notification('My message', {
        appearance: 'error'
      })
    );
    assert.dom('[data-test-notification]').hasClass('notification-card--error');
  });

  test('it does not render close button when allowClosing=false', async function (assert) {
    this.set(
      'notification',
      new Notification('My message', {
        allowClosing: false
      })
    );

    await render(template);

    assert
      .dom('[data-test-notification] .notification-card__close-btn')
      .doesNotExist();
  });

  test('it calls remove function from service on close-btn click', async function (assert) {
    assert.expect(1);

    this.set(
      'notification',
      new Notification('My message', { transitionDuration: 1 })
    );

    const service: NotificationsService = this.owner.lookup(
      'service:notifications'
    );

    sinon.stub(service, 'remove').callsFake((n: Notification): void => {
      assert.equal(n, this.get('notification'));
    });

    await render(template);

    await click('[data-test-notification] .notification-card__close-btn__icon');

    sinon.restore();
  });

  test('it renders and calls custom actions', async function (assert) {
    assert.expect(5);

    this.set(
      'notification',
      new Notification('My message', {
        transitionDuration: 1,
        customActions: [
          {
            label: 'Undo',
            onClick: () => {
              assert.ok(true);
            }
          },
          {
            label: 'Ok',
            onClick: () => {
              assert.ok(true);
            }
          }
        ]
      })
    );

    const service: NotificationsService = this.owner.lookup(
      'service:notifications'
    );

    sinon.stub(service, 'remove').callsFake((n: Notification): void => {
      assert.equal(n, this.get('notification'));
    });

    await render(template);

    assert
      .dom('[data-test-notification] .notification-card__custom-actions__btn')
      .exists({ count: 2 });

    assert
      .dom(
        '[data-test-notification] .notification-card__custom-actions__btn:first-child'
      )
      .hasText('Undo');

    assert
      .dom(
        '[data-test-notification] .notification-card__custom-actions__btn:last-child'
      )
      .hasText('Ok');

    await click(
      '[data-test-notification] .notification-card__custom-actions__btn:first-child'
    );

    sinon.restore();
  });

  test('it pauses/resumes the timer on mouseenter/mouseleave', async function (assert) {
    assert.expect(2);

    this.set(
      'notification',
      new Notification('My message', { transitionDuration: 1 })
    );

    this.get('notification').timer = {
      pause() {
        assert.ok('should have paused');
      },
      resume() {
        assert.ok('should have resumed');
      }
    };

    await render(template);

    await triggerEvent('[data-test-notification]', 'mouseenter');
    await triggerEvent('[data-test-notification]', 'mouseleave');
  });
});
