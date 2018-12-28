/* eslint @atlassian/confluence-es6/matching-tests:0 */
import $ from "jquery";
import textHighlighter from "./jquery.texthighlighter.js"; // eslint-disable-line no-unused-vars

/*
 * A wrapped version of jquery highlighter plugin with customizations
 * It can be instantiated anywhere
 */
const CURRENT_HIGHLIGHT_SELECTOR = "ic-current-selection";

function TextHighlighter() {
  $.textHighlighter.createWrapper = function(options) {
    return $("<span></span>").addClass(options.highlightedClass);
  };
  this.$el = $("#main-content2").first();

  if (this.$el.length > 0) {
    this.$el.textHighlighter({
      highlightedClass: CURRENT_HIGHLIGHT_SELECTOR
    });
  }
}

TextHighlighter.prototype.highlight = function(range) {
  if (this.$el.length === 0) {
    return;
  }
  const $highlightNodes = $(this.$el.getHighlighter().doHighlight(range));

  return this.$el.getHighlighter().serializeHighlights($highlightNodes);
};

TextHighlighter.prototype.removeHighlight = function() {
  if (this.$el.length === 0) {
    return;
  }
  this.$el.getHighlighter().removeHighlights();
  return this;
};

/**
 * Deserializes highlights from stringified JSON given as parameter.
 */
TextHighlighter.prototype.deserializeHighlights = function(json, markerRef) {
  if (this.$el.length === 0) {
    return;
  }
  const wrapper = `<span class="inline-comment-marker" data-ref="${markerRef}"></span>`;

  return this.$el.getHighlighter().deserializeHighlights(json, wrapper);
};

export default TextHighlighter;
