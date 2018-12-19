import Vue from "vue";
import App from "./App.vue";
import VueQuillEditor from "vue-quill-editor";
import VTooltip from "v-tooltip";

// require styles
import "quill/dist/quill.core.css";
import "quill/dist/quill.snow.css";
import "quill/dist/quill.bubble.css";

Vue.use(VueQuillEditor /* { default global options } */);
Vue.use(VTooltip);
new Vue({
  el: "#app",
  render: h => h(App)
});
