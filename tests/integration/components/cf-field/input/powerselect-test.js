import { module, test } from "qunit";
import { setupRenderingTest } from "ember-qunit";
import { click, render } from "@ember/test-helpers";
import { hbs } from "ember-cli-htmlbars";
import Document from "ember-caluma/lib/document";

module("Integration | Component | cf-field/input/powerselect", function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    const singleChoice = {
      __typename: "ChoiceQuestion",
      slug: "test-single",
      label: "Test Single Choice",
      isHidden: "false",
      isRequired: "true",
      choiceOptions: {
        edges: [
          { node: { slug: "option-1", label: "Option 1" } },
          { node: { slug: "option-2", label: "Option 2" } },
          { node: { slug: "option-3", label: "Option 3" } }
        ]
      }
    };

    const multipleChoice = {
      __typename: "MultipleChoiceQuestion",
      slug: "test-multiple",
      label: "Test Multiple Choice",
      isHidden: "false",
      isRequired: "true",
      multipleChoiceOptions: {
        edges: [
          { node: { slug: "option-1", label: "Option 1" } },
          { node: { slug: "option-2", label: "Option 2" } },
          { node: { slug: "option-3", label: "Option 3" } }
        ]
      }
    };

    const form = {
      __typename: "Form",
      slug: "test-form",
      name: "Test Form",
      questions: [singleChoice, multipleChoice]
    };

    const document = Document.create(this.owner.ownerInjection(), {
      raw: {
        __typename: "Document",
        id: btoa("Document:xxxx-xxxx"),
        rootForm: form,
        forms: [form],
        answers: []
      }
    });

    this.setProperties({
      document,
      singleChoiceField: document.findField("test-single"),
      multipleChoiceField: document.findField("test-multiple")
    });
  });

  test("it renders (single)", async function(assert) {
    assert.expect(1);

    await render(
      hbs`{{cf-field/input/powerselect
        field=singleChoiceField
      }}`
    );

    assert.dom(".ember-power-select-trigger").exists();
  });

  test("it saves on click (single)", async function(assert) {
    assert.expect(3);

    this.set("onSave", choice => {
      this.set("singleChoiceField.answer.value", choice);
    });

    await render(
      hbs`{{cf-field/input/powerselect
        field=singleChoiceField
        onSave=onSave
      }}`
    );

    assert.dom(".ember-power-select-trigger").exists();
    await click(".ember-power-select-trigger");

    assert.dom(".ember-power-select-option").exists({ count: 3 });
    await click(".ember-power-select-option:first-child");

    assert.equal(this.singleChoiceField.answer.value, "option-1");
  });

  test("it renders (multiple)", async function(assert) {
    assert.expect(1);

    await render(
      hbs`{{cf-field/input/powerselect
        field=multipleChoiceField
      }}`
    );

    assert.dom(".ember-power-select-trigger").exists();
  });

  test("it saves on click (multiple)", async function(assert) {
    assert.expect(3);

    this.set("onSave", choices => {
      this.set("multipleChoiceField.answer.value", choices);
    });

    await render(
      hbs`{{cf-field/input/powerselect
        field=multipleChoiceField
        onSave=onSave
      }}`
    );

    // Check if select is being rendered.
    assert.dom(".ember-power-select-trigger").exists();
    // Open the dropdown menu.
    await click(".ember-power-select-trigger");
    // Check if dropdown content is being rendered.
    assert.dom(".ember-power-select-option").exists({ count: 3 });
    // Click first item from dropdown.
    await click(".ember-power-select-option:nth-child(1)");
    // Reopen dropdown menu.
    await click(".ember-power-select-trigger");
    // Select second item from dropdown .
    await click(".ember-power-select-option:nth-child(2)");

    assert.deepEqual(this.multipleChoiceField.answer.value, [
      "option-1",
      "option-2"
    ]);
  });

  test("it handles empty selections (multiple)", async function(assert) {
    assert.expect(3);

    this.set("onSave", choices => {
      this.set("multipleChoiceField.answer.value", choices);
    });

    await render(
      hbs`{{cf-field/input/powerselect
        field=multipleChoiceField
        onSave=onSave
      }}`
    );

    this.set("multipleChoiceField.answer.value", ["option-1"]);

    assert.dom(".ember-power-select-trigger").exists();
    await click(".ember-power-select-trigger");
    assert.dom(".ember-power-select-option[aria-selected='true']").exists();
    await click(".ember-power-select-option[aria-selected='true']");

    assert.deepEqual(this.multipleChoiceField.answer.value, []);
  });
});
