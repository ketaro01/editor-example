import TextHighlighter from "./texthighlighter";

const CURRENT_SELECTOR = "current-selection";
const MARKING_INLINE = "inline-comment-marker";

class Highlighter {
  constructor() {
    // createWrapper 재정의
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
    this.removeHighlightOne = this.removeHighlightOne.bind(this);
  }
  // HTML TEXT 를 nodeElement 로 생성
  htmlWrapper(html, options) {
    const template = document.createElement("template");
    html = html.trim();
    template.innerHTML = html;
    // ie의 경우 firstElementChild 사용
    return template.firstElementChild || template.content.firstChild;
  }

  // 선택된 range 영역을 highlight
  highlight(range) {
    if (this.el.length === 0) {
      return;
    }

    const $highlightNodes = this.el.doHighlight(range);

    return this.el.serializeHighlights($highlightNodes);
  }

  // highlight 영역을 reset. className을 전달한 경우 해당 className highlight 를 제거.
  removeHighlight(className) {
    if (this.el.length === 0) {
      return;
    }
    this.el.removeHighlights(undefined, className);
    return this;
  }

  // serialize text를 사용하여 해당 정보를 토대로 highlight 처리.
  // markerRef값이 없는경우 저장된 정보를 토대로 생성
  // markerRef값이 존재하는 경우 wrapper 의 내용으로 신규 등록.
  deserializeHighlights(json, markerRef) {
    if (this.el.length === 0) {
      return;
    }
    if (!markerRef) {
      this.el.deserializeHighlights(json);
    } else {
      const wrapper = `<span class="inline-comment-marker" data-ref="${markerRef}"></span>`;

      this.el.deserializeHighlights(json, wrapper);
    }
    return this.el.serializeHighlightsAll(MARKING_INLINE);
  }

  // 저장된 key인 경우 해당 값을 지운 뒤 deserialize.
  removeHighlightOne(key) {
    const nowSerialize = this.el.serializeHighlightsAll(MARKING_INLINE);
    const serialize = JSON.parse(nowSerialize);
    const serializeFilter = serialize.filter(
      v => v[0].indexOf(`data-ref="${key}"`) === -1
    );

    // 필터링된 변경점이 없는 경우. 현재값 반환.
    if (serialize.length !== serializeFilter.length) return nowSerialize;

    const filterdText = JSON.stringify(serializeFilter);
    this.removeHighlight(MARKING_INLINE);
    return this.deserializeHighlights(filterdText);
  }
}

export default Highlighter;
