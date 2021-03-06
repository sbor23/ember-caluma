import Base from "ember-caluma/lib/base";
import { defineProperty, computed } from "@ember/object";
import { reads } from "@ember/object/computed";
import { assert } from "@ember/debug";
import { camelize } from "@ember/string";
import { task } from "ember-concurrency";
import { queryManager } from "ember-apollo-client";

import getDynamicOptions from "ember-caluma/gql/queries/get-dynamic-options";

/**
 * Object which represents a question in context of a field
 *
 * @class Question
 */
export default Base.extend({
  apollo: queryManager(),

  init() {
    assert(
      "A graphql question `raw` must be passed",
      this.raw && /Question$/.test(this.raw.__typename)
    );

    defineProperty(this, "pk", {
      writable: false,
      value: `Question:${this.raw.slug}`
    });

    this._super(...arguments);

    this.setProperties(this.raw);
  },

  /**
   * Load all dynamic options for this question
   *
   * @method loadDynamicOptions.perform
   * @return {Object[]} The dynamic options
   * @public
   */
  loadDynamicOptions: task(function*() {
    if (!this.isDynamic) return;

    const [question] = yield this.apollo.query(
      {
        query: getDynamicOptions,
        fetchPolicy: "network-only",
        variables: { question: this.slug }
      },
      "allQuestions.edges"
    );

    return (
      question.node.dynamicChoiceOptions ||
      question.node.dynamicMultipleChoiceOptions
    );
  }),

  dynamicChoiceOptions: reads("loadDynamicOptions.lastSuccessful.value"),
  dynamicMultipleChoiceOptions: reads(
    "loadDynamicOptions.lastSuccessful.value"
  ),

  /**
   * Whether the question is a single choice question
   *
   * @property {Boolean} isChoice
   * @accessor
   */
  isChoice: computed("__typename", function() {
    return /(Dynamic)?ChoiceQuestion/.test(this.__typename);
  }),

  /**
   * Whether the question is a multiple choice question
   *
   * @property {Boolean} isMultipleChoice
   * @accessor
   */
  isMultipleChoice: computed("__typename", function() {
    return /(Dynamic)?MultipleChoiceQuestion/.test(this.__typename);
  }),

  /**
   * Whether the question is a dynamic single or multiple choice question
   *
   * @property {Boolean} isDynamic
   * @accessor
   */
  isDynamic: computed("__typename", function() {
    return /Dynamic(Multiple)?ChoiceQuestion/.test(this.__typename);
  }),

  /**
   * All valid options for this question
   *
   * @property {Object[]} options
   * @accessor
   */
  options: computed(
    "choiceOptions.edges.[]",
    "dynamicChoiceOptions.edges.[]",
    "multipleChoiceOptions.edges.[]",
    "dynamicMultipleChoiceOptions.edges.[]",
    function() {
      if (!this.isChoice && !this.isMultipleChoice) return null;

      const key = camelize(this.__typename.replace(/Question$/, "Options"));

      return this.getWithDefault(
        `${key}.edges`,
        []
      ).map(({ node: { label, slug } }) => ({ label, slug }));
    }
  )
});
