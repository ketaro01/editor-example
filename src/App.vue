<template>
  <div id="app">
    <div v-if="false">
      <!-- Quill -->
      <quill-editor ref="myQuillEditor" v-model="content" style="height: 300px;"></quill-editor>
      <textarea @input="handleOnChange" style="width:100%; height: 300px;margin-top: 100px;"></textarea>
    </div>
    <div v-if="false">
      <!-- Summernote -->
      <Summernote name="html-editor" :model.sync="text"></Summernote>
    </div>
    <div v-if="false">
      <!-- 스마트 에디터 -->
      <textarea name="secontents" id="secontents" v-model="content" style="display:none;"></textarea>
      입력된 내용 {{ content }}
    </div>
    <div v-if="false">
      <!-- 파일 업로드 -->
      <!-- 
        * 추가
        참고
        https://github.com/updivision/vue2-multi-uploader
        1. 개별삭제,
        # 2. 썸네일 좀더 깔끔하게,
        # 3. 영역 깔꼼하게,
        # 4. 드래그로 넘길 시 파일을 추가할지 초기화할지 결정.
        5. files 서버전송.
        6. axios 업로드 대용량 처리 \\ketaro02\public
      -->
      <FileUploader
        v-model="files"
        type="^(image)"
        name="items[]"
        @removeFile="removeFile"
        :display="{ thumbnail: true, fileName: true }"
        :maxCount="12"
      />
      <!-- App > {{ this.files }} -->
    </div>
    <div v-if="false">
      <MemoDocument/>
    </div>
    <div>
      <MemoDocumentTest/>
    </div>
    <br>
    <button @click="handleOnChange">test</button>
  </div>
</template>

<script>
import Summernote from "./Summernote";
import FileUploader from "multi-file-uploader";
import MemoDocument from "./MemoDocument";
import MemoDocumentTest from "./MemoDocumentTest";
export default {
  name: "app",
  data() {
    return {
      content: "",
      text: "a",
      editor_object: [],
      files: {
        save: [],
        input: []
      },
      isSelect: false
    };
  },
  mounted() {
    //if (document.querySelector("#secontents")) this.createSmartEditor();
    //this.getFileList();

    // https://github.com/mir3z/texthighlighter
    // 참고하여 작업
    const NODE_TYPE = {
      ELEMENT_NODE: 1,
      TEXT_NODE: 3
    };
    const content = document.querySelector("#main-content");
    // content.addEventListener(
    //   "mousedown",
    //   function(e) {
    //     if (this.isSelect) {
    //       this.isSelect = false;
    //       return;
    //     }
    //     this.isSelect = true;
    //     console.log("드래그시작");
    //   },
    //   false
    // );
    // content.addEventListener(
    //   "mouseup",
    //   function(e) {
    //     const sel = window.getSelection();
    //     if (!this.isSelect) {
    //       return;
    //     }
    //     if (sel.type === "Caret") {
    //       this.isSelect = false;
    //       return;
    //     }
    //     let range = sel.getRangeAt(0);
    //     const selectText = range.cloneContents().textContent.trim();

    //     // const selectionContents = range.extractContents();

    //     // const span = document.createElement("span");
    //     // const tmpP = document.createElement("p");
    //     // tmpP.appendChild(selectionContents);
    //     // const value = tmpP.innerHTML.replace(/<\/?span[^>]*>/g, "");
    //     // span.style.fontWeight = "bold";

    //     // span.innerHTML = value;
    //     // range.insertNode(span);
    //     var startContainer = range.startContainer,
    //       endContainer = range.endContainer,
    //       ancestor = range.commonAncestorContainer,
    //       goDeeper = true;

    //     if (range.endOffset === 0) {
    //       while (
    //         !endContainer.previousSibling &&
    //         endContainer.parentNode !== ancestor
    //       ) {
    //         endContainer = endContainer.parentNode;
    //       }
    //       endContainer = endContainer.previousSibling;
    //     } else if (endContainer.nodeType === NODE_TYPE.TEXT_NODE) {
    //       if (range.endOffset < endContainer.nodeValue.length) {
    //         endContainer.splitText(range.endOffset);
    //       }
    //     } else if (range.endOffset > 0) {
    //       endContainer = endContainer.childNodes.item(range.endOffset - 1);
    //     }

    //     if (startContainer.nodeType === NODE_TYPE.TEXT_NODE) {
    //       if (range.startOffset === startContainer.nodeValue.length) {
    //         goDeeper = false;
    //       } else if (range.startOffset > 0) {
    //         startContainer = startContainer.splitText(range.startOffset);
    //         if (endContainer === startContainer.previousSibling) {
    //           endContainer = startContainer;
    //         }
    //       }
    //     } else if (range.startOffset < startContainer.childNodes.length) {
    //       startContainer = startContainer.childNodes.item(range.startOffset);
    //     } else {
    //       startContainer = startContainer.nextSibling;
    //     }
    //     console.log(startContainer);
    //     console.log(endContainer);
    //     console.log(goDeeper);
    //     this.isSelect = false;
    //   },
    //   false
    // );
  },
  destroyed() {
    if (this.input_area)
      this.input_area.removeEventListener(
        "input",
        this.handleOnChangeEditor,
        false
      );
  },
  methods: {
    getFileList() {
      fetch("http://127.0.0.1:3100/api/upload", {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(res => res.json())
        .then(json => {
          this.$set(this.files, "save", json);
        });
    },
    removeFile({ name }) {
      fetch("http://127.0.0.1:3100/api/upload", {
        method: "DELETE",
        body: JSON.stringify({ name }),
        headers: {
          "Content-Type": "application/json"
        }
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error(res.statusText);
        })
        .then(json => {
          this.$set(this.files, "save", json);
        })
        .catch(err => {
          console.log(err);
        });
    },
    handleOnChange(e) {
      if (!this.files.input || this.files.input.length === 0) {
        alert("업로드할 파일이 없음");
        return;
      }
      const formData = new FormData();
      this.files.input.map(v => {
        formData.append("file", v);
      });
      fetch("http://127.0.0.1:3100/api/upload", {
        method: "POST",
        body: formData
      })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error(res.statusText);
        })
        .then(json => {
          const nextProps = {
            input: [],
            save: json
          };
          this.files = nextProps;
          console.log(this.files);
        })
        .catch(err => {
          console.log(err);
        });
    },
    handleOnChangeEditor(e) {
      const value = e.target.innerHTML;
      this.content = value;
    },
    createSmartEditor() {
      // xss default option
      // script 삭제, iframe 제거는 기본적용 인듯함.
      // a href 는 삭제되지않음.

      const sLang = "ko_KR"; // 언어
      const aAdditionalFontSet = []; // 추가 폰트
      nhn.husky.EZCreator.createInIFrame({
        oAppRef: this.editor_object,
        elPlaceHolder: "secontents",
        sSkinURI: "/smarteditor2/SmartEditor2Skin.html",
        htParams: {
          bUseToolbar: true,
          bUseVerticalResizer: true,
          bUseModeChanger: true,
          aAdditionalFontList: aAdditionalFontSet // 추가 글꼴 목록
          //bSkipXssFilter: true // client-side xss filter 무시 여부 (true:사용하지 않음 / 그외:사용)
        },
        fOnAppLoad: () => {
          this.content = this.editor_object.getById["secontents"].getIR();
          const el_iframe = document.querySelector("iframe").contentDocument;

          const el_inputarea = el_iframe
            .querySelector("#se2_iframe")
            .contentDocument.querySelector(".se2_inputarea");
          this.input_area = el_inputarea;
          this.input_area.addEventListener(
            "input",
            this.handleOnChangeEditor,
            false
          );
        },
        I18N_LOCALE: sLang
      });
    }
  },
  computed: {
    editor() {
      return this.$refs.myQuillEditor.quill;
    }
  },
  components: {
    Summernote,
    FileUploader,
    MemoDocument,
    MemoDocumentTest
  }
};
</script>

<style lang="scss">
.tooltip {
  display: block !important;
  z-index: 10000;

  .tooltip-inner {
    background: black;
    color: white;
    border-radius: 16px;
    padding: 5px 10px 4px;
  }

  .tooltip-arrow {
    width: 0;
    height: 0;
    border-style: solid;
    position: absolute;
    margin: 5px;
    border-color: black;
  }

  &[x-placement^="top"] {
    margin-bottom: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 0 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      bottom: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="bottom"] {
    margin-top: 5px;

    .tooltip-arrow {
      border-width: 0 5px 5px 5px;
      border-left-color: transparent !important;
      border-right-color: transparent !important;
      border-top-color: transparent !important;
      top: -5px;
      left: calc(50% - 5px);
      margin-top: 0;
      margin-bottom: 0;
    }
  }

  &[x-placement^="right"] {
    margin-left: 5px;

    .tooltip-arrow {
      border-width: 5px 5px 5px 0;
      border-left-color: transparent !important;
      border-top-color: transparent !important;
      border-bottom-color: transparent !important;
      left: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[x-placement^="left"] {
    margin-right: 5px;

    .tooltip-arrow {
      border-width: 5px 0 5px 5px;
      border-top-color: transparent !important;
      border-right-color: transparent !important;
      border-bottom-color: transparent !important;
      right: -5px;
      top: calc(50% - 5px);
      margin-left: 0;
      margin-right: 0;
    }
  }

  &[aria-hidden="true"] {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.15s, visibility 0.15s;
  }

  &[aria-hidden="false"] {
    visibility: visible;
    opacity: 1;
    transition: opacity 0.15s;
  }

  &.popover {
    $color: #f9f9f9;

    .popover-inner {
      background: $color;
      color: black;
      padding: 24px;
      border-radius: 5px;
      box-shadow: 0 5px 30px rgba(black, 0.1);
    }

    .popover-arrow {
      border-color: $color;
    }
  }
}
</style>
