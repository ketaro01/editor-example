<template>
  <div>
    <div id="main-content2" v-html="!content ? content_original : content">
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
      <button @click="openComment(selectRange, selectText)">COMMENT</button>
      <br>
      <button>ISSUE</button>
    </div>
    <div v-if="useComment" class="commentBox">
      {{ selectText }}
      <textarea v-model="comment" style="width:100%;height: 80%;"/>
      <button @click="desirialize">저장</button>
      <button @click="closeComment">닫기</button>
    </div>
    <div class="memoBox" v-if="selectedComment">
      <span>선택문장 : {{ selectedComment.sentence }}</span>
      <br>
      <span>메모 : {{ selectedComment.comment }}</span>
      <button @click="removeComment(selectedComment.key)">삭제</button>
    </div>
  </div>
</template>

<script>
import loadScriptOnce from "load-script-once";
import api from "./api";
import TextHighlighter from "./th";
export default {
  data() {
    return {
      hltr: null,
      selectRange: null,
      isSelect: false,
      position: null,
      useComment: false,
      content_original: "",
      content: "",
      comment: "",
      comments: null,
      selectedComment: null,
      highlight: ""
    };
  },
  mounted() {
    api.get("/memo").then(response => {
      this.content_original = `
      <p>동해물과 백두산이 마르고 닳도록</p>
      <p>하느님이 보우하사 우리나라 만세</p>
      <ul>
        <li>동해물과 백두산이 마르고 닳도록</li>
        <li>하느님이 보우하사 우리나라 만세</li>
        <li>동해물과 백두산이 마르고 닳도록</li>
        <li>하느님이 보우하사 우리나라 만세</li>
      </ul>      
      <p>동해물과 백두산이 마르고 닳도록</p>
      <p>하느님이 보우하사 우리나라 만세</p>
      <ul>
        <li>동해물과 백두산이 마르고 닳도록</li>
        <li>하느님이 보우하사 우리나라 만세</li>
        <li>동해물과 백두산이 마르고 닳도록</li>
        <li>하느님이 보우하사 우리나라 만세</li>
      </ul>`;
      this.content = response.content;
      this.comments = response.comments;

      this.$nextTick(() => {
        this.eventBind();
        const el = document.querySelector("#main-content2");
        el.addEventListener("mousedown", this.reset, false);
        el.addEventListener("mouseup", this.dragEvent, false);
      });
    });
  },
  destroyed() {
    const el = document.querySelector("#main-content2");
    el.removeEventListener("mousedown", this.reset, false);

    el.removeEventListener("mouseup", this.dragEvent, false);
  },
  methods: {
    openComment(selectRange, selectText) {
      const highlight = new TextHighlighter()
        .removeHighlight()
        .highlight(selectRange);
      this.useComment = true;
      this.reset();
      this.highlight = highlight;
    },
    resetHighlight() {
      // 현재 선택된 영역 highlight 제거
      new TextHighlighter().removeHighlight();
    },
    // highlight 처리
    desirialize() {
      this.resetHighlight();
      const key = this.uniqID();
      new TextHighlighter().deserializeHighlights(this.highlight, key);
      const content = document.querySelector("#main-content2").innerHTML;
      this.saveComment(content, this.selectText, this.comment, key);
      this.reset();
      // 선택 영역 초기화
      this.selectRange = null;
      this.useComment = false;
      this.comment = "";
    },
    saveComment(content, sentence, comment, key) {
      const comments = Object.assign({}, this.comments ? this.comments : {}, {
        [key]: {
          sentence,
          comment
        }
      });

      api.set("/memo", { content, comments }).then(() => {
        this.content = content;
        this.comments = comments;
        this.$nextTick(() => {
          this.eventBind();
        });
      });
    },
    closeComment() {
      this.useComment = false;
      this.reset();
    },
    removeComment(key) {
      const container = document.querySelector("#main-content2");
      const els = container.querySelectorAll(`span[data-ref='${key}']`);
      for (let i = 0; i < els.length; i++) {
        const textNode = document.createTextNode(els[i].textContent);
        els[i].parentNode.replaceChild(textNode, els[i]);
      }

      this.$delete(this.comments, key);

      api
        .set("/memo", { content: container.innerHTML, comments: this.comments })
        .then(() => {
          this.content = container.innerHTML;
          this.selectedComment = null;
          this.$nextTick(() => {
            this.eventBind();
          });
        });
    },
    eventBind() {
      const container = document.querySelector("#main-content2");
      const els = container.querySelectorAll(".inline-comment-marker");
      for (let i = 0; i < els.length; i++) {
        els[i].removeEventListener("click", this.clickHiglight);
        const key = els[i].getAttribute("data-ref");
        els[i].addEventListener(
          "click",
          this.clickHiglight.bind(null, key),
          false
        );
      }
    },
    clickHiglight(key) {
      if (this.comments[key]) {
        this.selectedComment = {
          key,
          ...this.comments[key]
        };
      }
    },
    reset() {
      if (!this.useComment) this.resetHighlight();
      this.selectedComment = null;
      this.position = null;
      this.isSelect = true;
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
  cursor: pointer;
}
.memoBox {
  background-color: #eee;
  width: 400px;
  height: 400px;
  position: absolute;
  right: 0px;
  top: 200px;
}
.commentBox {
  background-color: #eee;
  border: 1px solid #000;
  width: 400px;
  height: 400px;
  position: absolute;
  right: 0px;
  top: 100px;
}
</style>
