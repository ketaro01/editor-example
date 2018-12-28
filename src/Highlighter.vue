<template>
  <div>
    <h3>형광펜 적용 범위</h3>
    <div>
      <button @click="removeHighlight">highlight 제거</button>
    </div>
    <div id="main-content">
      <ul>
        <li>동해물과 백두산이 마르고 닳도록1</li>
        <li>동해물과 백두산이 마르고 닳도록2</li>
        <li>동해물과 백두산이 마르고 닳도록3</li>
        <li>동해물과 백두산이 마르고 닳도록4</li>
        <li>동해물과 백두산이 마르고 닳도록5</li>
        <li>동해물과 백두산이 마르고 닳도록6</li>
        <li>동해물과 백두산이 마르고 닳도록7</li>
      </ul>
    </div>
    <h3>형광펜 미적용 범위</h3>
    <div id="main-content">
      <ul>
        <li>동해물과 백두산이 마르고 닳도록1</li>
        <li>동해물과 백두산이 마르고 닳도록2</li>
        <li>동해물과 백두산이 마르고 닳도록3</li>
        <li>동해물과 백두산이 마르고 닳도록4</li>
        <li>동해물과 백두산이 마르고 닳도록5</li>
        <li>동해물과 백두산이 마르고 닳도록6</li>
        <li>동해물과 백두산이 마르고 닳도록7</li>
      </ul>
    </div>
    {{ this.serialize }}
  </div>
</template>

<script>
import NHighlighter from "../node-highlighter";
import api from "./api";
export default {
  data() {
    return {
      serialize: `[["<span class=\'current-selection\'></span>","백두산이 마르고 닳도록1","0:0:1",5,13],["<span class=\'current-selection\'></span>","동해물과 백","0:2:0",0,6],["<span class=\'current-selection\'></span>","두산이 마르고","0:4:1",6,7],["<span class=\'current-selection\'></span>","이 마","0:8:1",8,3],["<span class=\'current-selection\'></span>","닳도록5","0:8:5",0,4],["<span class=\'current-selection\'></span>","동해물과 백두산이 마르고","0:10:0",0,13],["<span class=\'current-selection\'></span>","도록6","0:10:2",2,3],["<span class=\'current-selection\'></span>","동해물과 백두산이 마르고 닳","0:12:0",0,15]]`
    };
  },
  created() {},
  mounted() {
    const el = document.querySelector("#main-content");
    el.addEventListener("mouseup", this.highlightEvent);
    el.addEventListener("touch", this.highlightEvent);
    this.loadHighlight();
  },
  destroyed() {
    const el = document.querySelector("#main-content");
    el.removeEventListener("mouseup", this.highlightEvent);
    el.removeEventListener("touch", this.highlightEvent);
  },
  methods: {
    loadHighlight() {
      api.get("/highlight").then(response => {
        this.serialize = response.highlight;
        new NHighlighter().deserializeHighlights(this.serialize);
      });
    },
    highlightEvent(e) {
      const sel = window.getSelection();
      // 단순 클릭.
      if (sel.type === "Caret") return;
      const range = sel.getRangeAt(0);
      // 선택된 범위가 공백 혹은 내용이 없을 경우.
      if (!range.cloneContents().textContent.trim()) return;

      this.serialize = new NHighlighter(true).highlight(range, this.uniqID());
      api.set("/highlight", { highlight: this.serialize });
      // selection focus out
      // window.getSelection().empty(); // ie 에서 미지원
      window.getSelection().removeAllRanges();
    },
    removeHighlight() {
      api.delete("/highlight").then(() => {
        new NHighlighter().removeHighlight("inline-comment-marker");
      });
    },
    uniqID() {
      return Math.random()
        .toString(36)
        .substr(2, 9);
    }
  },
  computed: {}
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
