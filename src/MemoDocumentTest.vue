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
    {{ this.highlight }}
  </div>
</template>

<script>
import Highlighter from "../text-highlighter";
export default {
  data() {
    return {
      highlight: [],
      selectRange: null
    };
  },
  mounted() {
    const el = document.querySelector("#main-content");
    el.addEventListener("mouseup", this.dragEvent);
    el.addEventListener("touchend", this.dragEvent);
  },
  destroyed() {
    const el = document.querySelector("#main-content");
    el.removeEventListener("mouseup", this.dragEvent);
    el.removeEventListener("touchend", this.dragEvent);
  },
  methods: {
    dragEvent(e) {
      try {
        this.selectRange = this.getRange();
      } catch (e) {
        console.log(e.message);
      }
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
    selectHighlight() {
      if (!this.selectRange) return;
      const highlight = new Highlighter().highlight(this.selectRange);
      this.highlight = highlight;
      window.getSelection().empty();
    }
  }
};
</script>

<style>
.current-selection {
  background-color: #aaa;
}
</style>
