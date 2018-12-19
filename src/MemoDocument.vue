<template>
  <div>
    <div style="white-space: pre-wrap;" id="main-content">
      <p>동해물과 백두산이 마르고 닳도록</p>
      <p>하느님이 보우하사 우리나라 만세</p>
      <ul>
        <li>동해물과 백두산이 마르고 닳도록</li>
        <li>하느님이 보우하사 우리나라 만세</li>
        <li>동해물과 백두산이 마르고 닳도록</li>
        <li>하느님이 보우하사 우리나라 만세</li>
      </ul>
    </div>
    <div id="main-content2">
      <p>동해물과 백두산이 마르고 닳도록</p>
      <p>하느님이 보우하사 우리나라 만세</p>
      <ul>
        <li>동해물과 백두산이 마르고 닳도록</li>
        <li>하느님이 보우하사 우리나라 만세</li>
        <li>동해물과 백두산이 마르고 닳도록</li>
        <li>하느님이 보우하사 우리나라 만세</li>
      </ul>
    </div>
    <button @click="resetHighlight">리셋</button>
    <button @click="desirialize">desirialize</button>
    <div
      v-if="position && isSelect"
      :style="`background-color:#eee;border:1px solid #000; width: ${position.boxWidth}px; height: ${position.boxHeight}px; position: absolute; top: ${position.top}px; left: ${position.left}px;z-index:400`"
    >
      <button @click="saveComment(content, selectRange, selectText)">COMMENT</button>
      <br>
      <button>ISSUE</button>
    </div>
    <div
      v-if="useComment"
      style="background-color:#eee;border:1px solid #000;width:400px; height:400px;position:absolute;right:0px;top:100px;"
    >
      {{ selectText }}
      <textarea v-model="content" style="width:100%;height: 80%;"/>
      <button @click="desirialize">저장</button>
    </div>
  </div>
</template>

<script>
import loadScriptOnce from "load-script-once";
import TextHighlighter from "./th";
export default {
  data() {
    return {
      hltr: null,
      selectRange: null,
      isSelect: false,
      position: null,
      useComment: false,
      content: "",
      highlight: ""
    };
  },
  mounted() {
    const el = document.querySelector("#main-content2");

    el.addEventListener("mousedown", this.reset, false);

    el.addEventListener("mouseup", this.dragEvent, false);
  },
  destroyed() {
    const el = document.querySelector("#main-content2");
    el.removeEventListener("mousedown", this.reset, false);

    el.removeEventListener("mouseup", this.dragEvent, false);
  },
  methods: {
    saveComment(content, selectRange, selectText) {
      const highlight = new TextHighlighter()
        .removeHighlight()
        .highlight(selectRange);
      this.useComment = true;
      this.isSelect = false;
      this.position = null;
      this.highlight = highlight;
    },
    resetHighlight() {
      new TextHighlighter().removeHighlight();
    },
    desirialize() {
      new TextHighlighter()
        .removeHighlight()
        .deserializeHighlights(this.highlight, this.uniqID());
    },
    reset() {
      this.position = null;
      this.isSelect = true;
      this.selectRange = null;
    },
    dragEvent() {
      if (!this.isSelect) {
        return;
      }
      const sel = window.getSelection();
      if (sel.type === "Caret") {
        this.isSelect = false;
        return;
      }
      let range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const { width, height, top, left } = rect;
      // boxsize width 200px, height: 30px
      const boxWidth = 200;
      const boxHeight = 100;
      this.position = {
        boxWidth,
        boxHeight,
        top: top - boxHeight - 5,
        left: width < left + 20 ? left : left + 20
      };
      this.selectRange = range;
    },
    uniqID() {
      return Math.random()
        .toString(36)
        .substr(2, 9);
    }
  },

  computed: {
    selectText() {
      if (!this.selectRange) return "";
      return this.selectRange.cloneContents().textContent.trim();
    }
  }
};
</script>

<style>
.ic-current-selection {
  background-color: #aee;
}
.inline-comment-marker {
  background-color: #eaa;
}
</style>
