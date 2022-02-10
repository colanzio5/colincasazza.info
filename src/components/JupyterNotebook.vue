<template>
  <iframe
    :src="notebookPath"
    sandbox="allow-scripts allow-same-origin"
    frameborder="0"
    id="notebook"
    class="w-full h-full p-4"
  ></iframe>
</template>

<script lang="ts">
import { Vue, Options } from "vue-class-component";
import { Prop } from "vue-property-decorator";
Options({
  name: "JupyterNotebook",
});
export default class JupyterNotebook extends Vue {
  @Prop() notebookPath!: string;

  mounted() {
    this.importParentStyles();
  }

  importParentStyles() {
    var parentStyleSheets = parent.document.styleSheets as any;
    var cssString = "";
    for (var i = 0, count = parentStyleSheets.length; i < count; ++i) {
      if (parentStyleSheets[i].cssRules) {
        var cssRules = parentStyleSheets[i].cssRules;
        for (var j = 0, countJ = cssRules.length; j < countJ; ++j)
          cssString += cssRules[j].cssText;
      } else cssString += parentStyleSheets[i].cssText; // IE8 and earlier
    }
    var style = document.createElement("style") as any;
    style.type = "text/css";
    try {
      style.innerHTML = cssString;
    } catch (ex) {
      style.styleSheet.cssText = cssString; // IE8 and earlier
    }
    document.getElementsByTagName("head")[0].appendChild(style);
  }
}
</script>