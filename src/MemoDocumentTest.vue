<template>
  <div>
    <div id="main-content">
      <p>동해물과 백두산이 마르고 닳도록</p>
      <p>하느님이 보우하사 우리나라 만세</p>
      <ul>
        <li>동해물과 백두산이 마르고 닳도록</li>
        <li>하느님이 보우하사 우리나라 만세</li>
        <li>
          동해물과
          <span style="color:#f00;">백두산이</span> 마르고 닳도록
        </li>
        <li>하느님이 보우하사 우리나라 만세</li>
      </ul>
    </div>
    <button @click="selectHighlight">영역선택</button>
    <button @click="removeHighlight">제거</button>
    <button @click="() => { this.removeHighlightOne('uf52v8724'); }">1요소제거</button>
    <button @click="deserialize">디시리얼라이즈</button>
    {{ this.highlight }}
  </div>
</template>

<script>
import Highlighter from "../node-highlighter";
export default {
  data() {
    return {
      highlight: "",
      selectRange: null,
      serialize: `[["<span class=\'inline-comment-marker\' data-ref=\'9qcln72k1\'></span>"," 백두산이 마르고 닳도록","4:0:1",4,13],["<span class=\'inline-comment-marker\' data-ref=\'9qcln72k1\'></span>","하느님이 보","4:2:0",0,6],["<span class=\'inline-comment-marker\' data-ref=\'uf52v8724\'></span>","하느님이 보우하사 우리나","4:6:0",0,13]]`
    };
  },
  mounted() {
    const el = document.querySelector("#main-content");
    el.addEventListener("mouseup", this.dragEvent);
    el.addEventListener("touchend", this.dragEvent);
    if (this.serialize) this.loadHighlight();
  },
  destroyed() {
    const el = document.querySelector("#main-content");
    el.removeEventListener("mouseup", this.dragEvent);
    el.removeEventListener("touchend", this.dragEvent);
  },
  methods: {
    dragEvent(e) {
      try {
        // 외부 확장모듈 사용시 에러 발생 ex) pigtoolbox
        const range = this.getRange();
        this.selectRange = range;
      } catch (e) {
        console.log(e.message);
      }
    },
    loadHighlight() {
      new Highlighter().removeHighlight().deserializeHighlights(this.serialize);
    },
    getRange() {
      const sel = window.getSelection();
      if (sel.type === "Caret") {
        throw new Error("is click");
      }
      return sel.getRangeAt(0);
    },
    removeHighlight() {
      new Highlighter().removeHighlight();
    },
    removeHighlightOne(key) {
      console.log(key);
      this.serialize = new Highlighter().removeHighlightOne(key);
    },
    selectHighlight() {
      if (!this.selectRange) return;
      // 선택한 영역의 selectionRange를 가져온뒤 저장.
      const highlight = new Highlighter()
        .removeHighlight()
        .highlight(this.selectRange);
      this.highlight = highlight;

      // selection focus out
      // window.getSelection().empty(); // ie 에서 미지원
      window.getSelection().removeAllRanges();
    },
    resetHighlight() {
      // 현재 선택된 영역 highlight 제거
      new Highlighter().removeHighlight();
    },
    deserialize() {
      // highlight정보가 없을 시 리턴
      if (!this.highlight) return;

      // DB에 반환된 serialize(전체 highlight)를 저장.
      this.serialize = new Highlighter()
        .removeHighlight()
        .deserializeHighlights(this.highlight, this.uniqID());
    },
    uniqID() {
      return Math.random()
        .toString(36)
        .substr(2, 9);
    }
  }
};
</script>

<style>
.current-selection {
  background-color: #aaa;
}
.inline-comment-marker {
  background-color: #fcc;
}
</style>
