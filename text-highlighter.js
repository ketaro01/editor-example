import TextHighlighter from "./texthighlighter";

class Highlighter {
  constructor() {
    const CURRENT_SELECTOR = "current-selection";

    TextHighlighter.createWrapper = options => {
      return this.htmlWrapper(
        `<span class='${CURRENT_SELECTOR}'></span>`,
        options
      );
    };

    const content = document.querySelector("#main-content");

    if (content) {
      this.el = new TextHighlighter(content, {
        highlightedClass: CURRENT_SELECTOR
      });
    }
    this.highlight = this.highlight.bind(this);
    this.removeHighlight = this.removeHighlight.bind(this);
  }
  htmlWrapper(html, options) {
    const template = document.createElement("template");
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
  }
  highlight(range) {
    if (this.el.length === 0) {
      return;
    }

    const $highlightNodes = this.el.doHighlight(range);

    return this.el.serializeHighlights($highlightNodes);
  }
  removeHighlight() {
    if (this.el.length === 0) {
      return;
    }
    this.el.removeHighlights();
    return this;
  }
  deserializeHighlights(json, markerRef) {
    if (this.el.length === 0) {
      return;
    }
    const wrapper = `<span class="inline-comment-marker" data-ref="${markerRef}"></span>`;

    return this.el.deserializeHighlights(json, wrapper);
  }
}

export default Highlighter;
