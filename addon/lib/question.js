import Base from "ember-caluma/lib/base";
import { assert } from "@ember/debug";
import { computed } from "@ember/object";

/**
 * Object which represents a question in context of a field
 *
 * @class Question
 */
export default Base.extend({
  init() {
    this._super(...arguments);

    assert(
      "A graphql question `raw` must be passed",
      this.raw && /Question$/.test(this.raw.__typename)
    );

    this.setProperties(this.raw);
  },

  /**
   * The unique identifier for the question which consists of the question slug
   * prefixed by "Question".
   *
   * E.g: `Question:some-question-slug`
   *
   * @property {String} pk
   * @accessor
   */
  pk: computed("slug", function() {
    return `Question:${this.slug}`;
  })
});
