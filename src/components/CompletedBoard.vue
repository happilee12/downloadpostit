<template>
  <v-container mt-5>
    <v-row>
      <v-col cols="12" md="9" sm="12">
        <v-text-field v-model="searchText" label="Search" solo></v-text-field>
      </v-col>
      <v-col cols="12" md="3" sm="12">
        <v-select
          :items="categoryList"
          v-model="subCategory"
          label="Category"
          solo
        ></v-select>
      </v-col>
    </v-row>

    <v-row dense justify-content="start">
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="3"
        v-for="(postit, index) in displayedPostits"
        :key="`postit-` + index"
      >
        <v-card class="postit-card mx-auto">
          <v-card-subtitle class="pb-0">
            # {{ index }} {{ postit.date ? postit.date : "" }}
          </v-card-subtitle>
          <textarea
            class="postit-editting-textarea"
            :ref="'postitTextarea'"
            @focus="startEditting(index)"
            @blur="endEditting(index)"
            @keydown="handleTabInput"
            v-model="postit.text"
            placeholder="메모할 내용을 입력하세요."
          ></textarea>

          <v-row class="postit-button-area" v-if="!isEditting[index]">
            <v-card-actions>
              <v-btn color="primary" text @click="remove(postit.id)">
                삭제
              </v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const { ipcRenderer } = require("electron");
import deleteSoundEffect from "../assets/delete.mp3";
const deleteSound = new Audio(deleteSoundEffect);
const ALL = "ALL";
import { setCategory } from "@/js/memo";

export default {
  name: "AllBoard",
  data: () => ({
    postits: [],
    isEditting: [],
    searchText: "",
    subCategory: "",
  }),
  mounted() {
    ipcRenderer.send("setCompleted");
    ipcRenderer.on("completed", (event, completedPostits) => {
      this.postits = [...completedPostits].reverse();
      this.isEditting = new Array(completedPostits.length).fill(false);
    });
  },
  computed: {
    categoryList: function () {
      return [
        ALL,
        ...new Set(this.postits.map((item) => item.subCategory)),
      ].filter((item) => item);
    },
    displayedPostits: function () {
      /** filter by selected category */
      let categoryFiltered;
      if (!this.subCategory || !this.postits || this.subCategory == ALL) {
        categoryFiltered = this.postits;
      } else {
        categoryFiltered = this.postits.filter(
          (item) => item.subCategory == this.subCategory
        );
      }

      /** filter by searchKeyword */
      if (!this.searchText) return categoryFiltered;
      else {
        return categoryFiltered.filter((item) =>
          item.text.includes(this.searchText)
        );
      }
    },
  },
  methods: {
    handleTabInput: function (e) {
      if (e.key == "Tab") {
        e.preventDefault();
        const targetTextArea = e.target;
        var start = targetTextArea.selectionStart;
        var end = targetTextArea.selectionEnd;

        // set textarea value to: text before caret + tab + text after caret
        targetTextArea.value =
          targetTextArea.value.substring(0, start) +
          "\t" +
          targetTextArea.value.substring(end);

        // put caret at right position again
        targetTextArea.selectionStart = targetTextArea.selectionEnd = start + 1;
      }
    },
    startEditting: function (index) {
      this.$set(this.isEditting, index, true);
      const targetItem = this.$refs.postitTextarea[index];
      setTimeout(function () {
        targetItem.focus();
      }, 0);
      console.log("started editting", index);
    },
    endEditting: function (displayIndex) {
      this.$set(this.isEditting, displayIndex, false);
      const postitIndex = this.postits.findIndex(
        (memo) => memo.id == this.displayedPostits[displayIndex].id
      );
      this.postits[postitIndex] = setCategory(this.postits[postitIndex]);
      ipcRenderer.send("saveCompleted", [...this.postits].reverse());
    },
    remove: function (id) {
      deleteSound.play();
      const targetIndex = this.postits.findIndex((memo) => memo.id == id);
      const target = this.postits[targetIndex];
      this.postits.splice(targetIndex, 1);
      this.isEditting.splice(targetIndex, 1);
      ipcRenderer.send("saveCompleted", [...this.postits].reverse());
      ipcRenderer.send("addToDeletedAndSave", target);
    },
  },
};
</script>

<style lang="scss">
.postit-button-area {
  position: absolute;
  bottom: 10px;
  right: 14px;
}
</style>
