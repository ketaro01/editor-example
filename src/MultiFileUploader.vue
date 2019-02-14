<template>
  <div class="form">
    <form role="form" enctype="multipart/form-data" @submit.prevent="onSubmit">
      <div
        :class="['mainbox', { dragged }]"
        @dragenter="dragged = true"
        @dragover="dragged = true"
        @dragleave="dragged = false"
        @dragend="dragged = false"
      >
        <input
          class="file_input"
          type="file"
          id="items"
          :name="name"
          accept="image/*"
          multiple
          @drop="e=> { dragged = false; e.preventDefault(); e.stopPropagation(); onChange(e) }"
          @dragover="e=> { dragged = true; e.preventDefault(); e.stopPropagation(); }"
          @change="onChange"
        >
        <div class="tip" v-if="!fileUsed || dragged">
          <h3>파일을 드래그</h3>
          <h3>혹은 클릭하여 선택</h3>
        </div>
        <div class="file_list" v-if="!dragged && !fileLoad">
          <ul class="ulbox">
            <li v-for="(file,i) in fileList.sFile" :key="`s${i}`">
              <div class="liBox">
                <div class="fileName" v-if="display.fileName">{{ file.name }}</div>
                <img v-if="display.thumbnail" :src="file.url" width="100">
                <a
                  @click="e => { e.stopPropagation(); onSaveFileRemove(i) }"
                  style="position: absolute;"
                >remove</a>
              </div>
            </li>
            <li v-for="(file, i) in fileList.iFile" :key="`i${i}`">
              <div class="liBox">
                <div class="fileName" v-if="display.fileName">{{ file.name }}</div>
                <img v-if="display.thumbnail" :src="file.image" width="100">
                <a
                  @click="e => { e.stopPropagation(); onInputFileRemove(i) }"
                  style="position: absolute;"
                >remove</a>
              </div>
            </li>
            <li v-if="fileFullCount > this.viewMax" :key="this.viewMax">
              <div class="liBox">
                <div class="fileName">그외 {{ fileFullCount - (this.viewMax - 1) }}개</div>
              </div>
            </li>
          </ul>
        </div>
        <PulseLoader class="loader" :size="20" margin="10px" v-if="fileLoad"/>
      </div>
    </form>
    {{ this.saveFiles }}
  </div>
</template>

<script>
import { PulseLoader } from "@saeris/vue-spinners";

export default {
  data() {
    return {
      files: null,
      fileInfo: [],
      saveFiles: this.value.save ? this.value.save : [],
      dragged: false,
      fileLoad: false
    };
  },
  created() {},
  watch: {
    value: {
      handler(val) {
        this.saveFiles = val.save;
        if (val.input.length === 0) {
          this.files = val.input;
          this.fileInfo = [];
        }
      },
      deep: true
    }
  },
  props: {
    name: {
      type: String,
      default: "items[]"
    },
    value: {
      type: Object,
      default: Object
    },
    type: {
      type: String,
      default: null
    },
    viewMax: {
      type: Number,
      default: 12
    },
    maxCount: {
      type: Number,
      default: 12
    },
    mode: {
      /* 
      1. append
      2. reset 
      */
      type: String,
      default: "append"
    },
    display: {
      type: Object,
      default: () => {
        return {
          thumbnail: false,
          fileName: true
        };
      }
    }
  },
  computed: {
    fileUsed() {
      return (
        this.fileLoad ||
        this.fileList.iFile.length > 0 ||
        this.fileList.sFile.length > 0
      );
    },
    fileFullCount() {
      return this.iFile.length + this.sFile.length;
    },
    iFile() {
      return this.fileInfo ? this.fileInfo : [];
    },
    sFile() {
      return this.saveFiles ? this.saveFiles : [];
    },
    fileList() {
      if (this.fileFullCount < this.viewMax) {
        return {
          sFile: this.sFile,
          iFile: this.iFile
        };
      } else {
        const sFileCnt =
          this.sFile.length > this.viewMax
            ? this.viewMax - 1
            : this.sFile.length;
        const sFile = this.sFile.slice(0, sFileCnt);
        const remain = this.viewMax - sFileCnt;
        const tmpIFile =
          this.fileFullCount === this.viewMax
            ? this.iFile.slice(0, remain)
            : this.iFile.slice(0, remain - 1);
        const iFile = this.sFile.length > this.viewMax - 1 ? [] : tmpIFile;
        return {
          sFile,
          iFile
        };
      }
    }
  },
  methods: {
    update() {
      this.$emit("input", { save: this.saveFiles, input: this.files });
    },
    onSubmit() {},
    bytesToSize(bytes) {
      const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
      if (bytes === 0) return "n/a";
      let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
      if (i === 0) return bytes + " " + sizes[i];
      return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
    },
    onChange(e) {
      if (this.fileFullCount >= this.maxCount) {
        alert(`최대 업로드 갯수(${this.maxCount})를 초과했습니다.`);
        return;
      }
      if (this.mode === "reset" || !this.files) {
        this.files = [];
        this.fileInfo = [];
      }

      let files =
        (e.target.files && e.target.files.length !== 0 && e.target.files) ||
        (e.dataTransfer &&
          e.dataTransfer.files &&
          e.dataTransfer.files.length !== 0 &&
          e.dataTransfer.files);
      let fileSizes = 0;

      if (files) {
        this.fileLoad = true;
        const fileInfo = Object.keys(files)
          .filter(v => {
            if (!this.type) return true;
            const regex = new RegExp(this.type, "i");
            return files[v].type.match(regex);
          })
          .map(async v => {
            const fileSize = this.bytesToSize(files[v].size);
            fileSizes = fileSizes += files[v].size;
            this.files.push(files[v]);

            const getImage = file =>
              new Promise((resolve, reject) => {
                const render = new FileReader();
                render.onload = e => {
                  resolve(e.target.result);
                };
                render.readAsDataURL(file);
              });

            let image = null;
            if (this.display.thumbnail) {
              image = await getImage(files[v]);
            }

            return {
              name: files[v].name,
              size: fileSize,
              image
            };
          });

        Promise.all(fileInfo).then(result => {
          // 이전 데이터와 병합.
          this.fileInfo = this.fileInfo.concat(result);
          this.fileLoad = false;
          this.update();
        });
      }
    },
    onInputFileRemove(index) {
      // files formdata remove
      this.$delete(this.files, index);
      // file info remove
      this.$delete(this.fileInfo, index);
      // model update
      this.update();
    },
    onSaveFileRemove(index) {
      this.$emit("removeFile", this.saveFiles[index]);
    }
  },
  components: {
    PulseLoader
  }
};
</script>

<style>
.form {
  padding: 10px;
}
.mainbox {
  margin: auto;
  width: 600px;
  height: 200px;
  border: 3px dotted #2b3843;
  background-color: #ebebeb;
  position: relative;
  text-align: center;
}
.mainbox.dragged {
  background-color: #4e6162;
  border: 3px dotted #ebebeb;
  color: #ebebeb;
}
.file_input {
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}
.file_list ul {
  margin: 10px;
}

.ulbox {
  list-style: none;
  padding-left: 0;
  margin-left: 0;
}
.ulbox::after {
  content: "";
  display: block;
  clear: both;
}
.ulbox li {
  float: left;
  display: block;
  margin: 5px;
}
.ulbox li .liBox {
  position: relative;
  overflow: hidden;
  width: 80px;
  height: 80px;
  border: 1px solid #000;
}
.fileName {
  padding: 2px;
  overflow: hidden;
  font-size: 8px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.liBox a {
  display: none;
  background: red;
  padding: 3px;
  cursor: pointer;
  right: 3px;
  top: 3px;
}
.liBox:hover a {
  display: block;
}
</style>
