<template>
  <div>
    <div style="position:fixed; top: 0px; width: 100%;">
      <div style="background-color:#aaa; height: 5px; width: 0px;" id="progress"></div>
    </div>
    <h3>HTML CREATOR</h3>
    <div v-show="true" id="htmlBox">
      <div id="m1"></div>
      <div id="m2"></div>
      <div id="m3"></div>
      <div id="m4"></div>
      <div id="m5"></div>
    </div>
    <div v-html="mojip"></div>
  </div>
</template>

<script>
import htmlFile from "../test.html";
import mojipData from "./data";
import mojip from "./data";
export default {
  data() {
    return {
      tableData: {
        columns: ["층", "직급", "내선", "성명"],
        values: [
          ["4층", "대표이사", "800", "홍길동1 대표"],
          ["4층", "경영지원실", "511", "홍길동2"],
          ["4층", "재경파트", "513", "홍길동3"],
          ["4층", "재경파트", "515", "홍길동4"],
          ["4층", "재경파트", "516", "홍길동5"],
          ["4층", "총무파트", "514", "홍길동6"],
          ["2층", "개발부", "614", "홍길동7"],
          ["2층", "개발부", "612", "홍길동8"],
          ["2층", "개발부", "611", "홍길동9"],
          ["2층", "개발부", "615", "홍길동10"],
          ["2층", "개발부", "616", "홍길동11"],
          ["2층", "개발부", "617", "홍길동12"]
        ]
      },
      tag_p: this.htmlWrapper("<p></p>"),
      tag_table: this.htmlWrapper(
        `<table width="99%" align="center" cellpadding="10px" style="border-spacing:0;border-collapse:collapse;border:0px solid #; letter-spacing:-1px; line-height:24px;">
          <thead></thead>
          <tbody></tbody>
        </table>`
      ),
      tag_tr: this.htmlWrapper("<tr></tr>"),
      tag_th: this.htmlWrapper(
        `<th align="center" bgcolor="#eff8fe" style="font-size:14px; letter-spacing:-1px; line-height: 24px; border-style: solid; border-color: #d7d7d7; border-top-color: #3F3F3F;  font-family: malgun gothic, 맑은 고딕; border-width: 1px 1px 1px 0px;"></th>`
      ),
      tag_td: this.htmlWrapper(
        `<td align="center" bgcolor="#FFFFFF" style="font-size:14px; letter-spacing:-1px; line-height: 24px; border-width:0px 0px 1px 0px;border-style:solid; border-color:#d7d7d7; font-family:malgun gothic, 맑은 고딕;"></td>`
      ),
      tag_div: this.htmlWrapper("<div></div>"),
      mojip: `` //htmlFile
    };
  },
  mounted() {
    document.addEventListener("scroll", e => {
      const progress = document.querySelector("#progress");
      const h = document.documentElement,
        b = document.body,
        st = "scrollTop",
        sh = "scrollHeight";

      const percent =
        ((h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight)) * 100;

      progress.style.width = percent + "%";
    });

    this.createHtmlPage(mojipData);
  },
  methods: {
    createHtmlPage(mdata) {
      const tag = t => this[`tag_${t}`].cloneNode(true);
      const clone = node => node.cloneNode(true);
      const append = (arr, tName, parent, index, option = {}) => {
        const nIndex = index || 0;
        const tagName = typeof tName === "object" ? tName[nIndex] : tName;
        return arr.map((v, i) => {
          if (option.before) parent.appendChild(clone(option.before));
          const el = tag(tagName);
          if (typeof v === "object") {
            append(v, tName, el, nIndex + 1);
          } else {
            el.innerHTML = v;
          }
          if (option.child && option.child[i]) {
            el.appendChild(option.child[i]);
          }
          if (parent) {
            parent.appendChild(el);
            if (option.after) parent.appendChild(clone(option.after));
          }
          return el;
        });
      };
      const container = document.createElement("div"); //document.querySelector("#htmlBox");
      container.style.width = "860px";
      container.style.margin = "0 auto";
      const headImage = tag("div");
      headImage.innerHTML = `<img src="http://www.saraminimage.co.kr/recruit/bbs_recruit2/sj_a_icon_b_181107.png" alt="아이콘이미지">`;
      headImage.style["margin-top"] = "10px";
      const child = mdata.data.map(v => {
        if (v.type === "table") {
          const table = tag("table");
          const head = table.querySelector("thead"),
            body = table.querySelector("tbody");
          const title = tag("tr");
          append(v.columns, "th", title);
          head.appendChild(title);
          append(v.rows, ["tr", "td"], body);
          return table;
        } else if (v.type === "text") {
          if (typeof v.value === "object") {
            const group = tag("div");
            append(v.value, "p", group);
            return group.firstElementChild || group.content.firstChild;
          } else {
            const p = tag("p");
            p.innerHTML = v.value;
            return p;
          }
        }
      });

      const option = {
        before: headImage,
        child: child
      };
      append(mdata.title, "p", container, null, option);
      const wrap = document.createElement("div");
      wrap.appendChild(container);
      this.mojip = wrap.innerHTML;
    },
    createHtmlPage_TestData() {
      const tag = t => this[`tag_${t}`].cloneNode(true);
      const append = (arr, tName, parent, index) => {
        const nIndex = index || 0;
        const tagName = typeof tName === "object" ? tName[nIndex] : tName;
        arr.map(v => {
          const el = tag(tagName);
          if (typeof v === "object") {
            append(v, tName, el, nIndex + 1);
          } else {
            el.innerHTML = v;
          }
          parent.appendChild(el);
        });
      };
      const container = document.querySelector("#htmlBox");
      const table = tag("table");
      const head = table.querySelector("thead"),
        body = table.querySelector("tbody");
      const title = tag("tr");
      append(this.tableData.columns, "th", title);
      head.appendChild(title);

      append(this.tableData.values, ["tr", "td"], body);
      container.appendChild(table);
    },
    htmlWrapper(html) {
      const template = document.createElement("template");
      html = html.trim();
      template.innerHTML = html;
      // ie의 경우 firstElementChild 사용
      return template.firstElementChild || template.content.firstChild;
    }
  }
};
</script>

<style>
p {
  margin: 0;
  white-space: pre-wrap;
}
body {
  margin: 0px;
  padding: 0px;
}
</style>
