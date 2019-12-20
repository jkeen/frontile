import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | FormField::Input', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders with html attributes', async function(assert) {
    await render(hbs`<FormField::Input
                      name="some-name"
                      data-test-my-input />`);

    assert.dom('[data-test-my-input]').exists();
    assert.dom('[name="some-name"]').exists();
  });

  test('it should default type as text', async function(assert) {
    await render(hbs`<FormField::Input data-test-my-input />`);

    assert.dom('[data-test-my-input]').hasAttribute('type', 'text');
  });

  test('it should allow to change the input type', async function(assert) {
    await render(hbs`<FormField::Input @type="number" data-test-my-input />`);

    assert.dom('[data-test-my-input]').hasAttribute('type', 'number');
  });

  test('it renders @id arg', async function(assert) {
    await render(hbs`<FormField::Input @id="my-id" data-test-my-input />`);

    assert.dom('[data-test-my-input]').hasAttribute('id', 'my-id');
  });

  test('it renders id html attribute', async function(assert) {
    await render(hbs`<FormField::Input id="my-id" data-test-my-input />`);

    assert.dom('[data-test-my-input]').hasAttribute('id', 'my-id');
  });

  test('it adds size classes for @isSmall and @isLarge', async function(assert) {
    this.set('isSmall', true);
    this.set('isLarge', false);

    await render(
      hbs`<FormField::Input data-test-input @isSmall={{this.isSmall}} @isLarge={{this.isLarge}} />`
    );

    assert.dom('[data-test-input]').hasClass('form-input-sm');
    this.set('isSmall', false);
    this.set('isLarge', true);
    assert.dom('[data-test-input]').hasClass('form-input-lg');

    // should only add one size class
    this.set('isSmall', true);
    this.set('isLarge', true);
    assert.dom('[data-test-input]').hasClass('form-input-sm');
    assert.dom('[data-test-input]').doesNotHaveClass('form-input-lg');
  });

  test('renders @value arg, does not mutate it by default', async function(assert) {
    this.set('value', 'Josemar');

    await render(
      hbs`<FormField::Input class="my-input" @value={{this.value}} />`
    );

    assert.dom('.my-input').hasValue('Josemar');

    await fillIn('.my-input', 'Sam');

    assert.equal(
      this.get('value'),
      'Josemar',
      'should have not mutated the value'
    );
  });

  test('should call @onInput function arg', async function(assert) {
    assert.expect(4);
    this.set('value', 'Josemar');

    this.set('setName', (value: string) => {
      this.set('value', value);
      assert.ok(true, 'should have called function');
    });

    await render(
      hbs`<FormField::Input
            class="my-input"
            @value={{this.value}}
            @onInput={{this.setName}}
          />`
    );

    assert.dom('.my-input').hasValue('Josemar');

    await fillIn('.my-input', 'Sam');

    assert.dom('.my-input').hasValue('Sam');
    assert.equal(this.get('value'), 'Sam', 'should have mutated the value');
  });

  test('should call @onChange function arg', async function(assert) {
    assert.expect(4);
    this.set('value', 'Josemar');

    this.set('setName', (value: string) => {
      this.set('value', value);
      assert.ok(true, 'should have called function');
    });

    await render(
      hbs`<FormField::Input
            class="my-input"
            @value={{this.value}}
            @onChange={{this.setName}}
          />`
    );

    assert.dom('.my-input').hasValue('Josemar');

    await fillIn('.my-input', 'Sam');

    assert.dom('.my-input').hasValue('Sam');
    assert.equal(this.get('value'), 'Sam', 'should have mutated the value');
  });
});
