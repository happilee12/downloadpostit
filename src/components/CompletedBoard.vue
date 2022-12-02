<template>
  <v-container class="main-container" style="margin-top: 30px">
    <div class="expansion-panel">
      <div class="expansion-panel-header">
        <v-row dense justify-content="start" @click="expansionToggle">
          <h4>📜 히스토리 추출</h4>
          <div
            class="expand-more-icon"
            :class="{ isToggled: expansionToggleOn }"
          >
            <v-img :src="require('../assets/expand-more.png')" />
          </div>
        </v-row>
      </div>
      <div
        class="expansion-panel-body"
        :class="{ isToggled: expansionToggleOn }"
      >
        <v-row dense justify-content="start">
          <v-col cols="12" sm="4" xs="12">
            <v-date-picker
              v-model="exportDates"
              no-title
              range
              color="yellow"
            ></v-date-picker>
          </v-col>
          <v-col cols="12" sm="8" xs="12">
            <textarea
              color="yellow"
              class="export-textarea"
              :ref="'exportTextArea'"
              v-model="exportText"
            ></textarea>
            <v-row dense justify="end">
              <v-btn
                class="copy-button"
                color="yellow"
                elevation="1"
                @click="copyToClipboard"
                >클립보드에 복사</v-btn
              >
            </v-row>
          </v-col>
        </v-row>
      </div>
    </div>

    <v-row dense justify-content="start">
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="3"
        v-for="(postit, index) in postits"
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
              <v-btn color="primary" text @click="remove(index)"> 삭제 </v-btn>
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
const moment = require("moment");
import { setCategory } from "@/js/memo";

export default {
  name: "CompletedBoard",
  data: () => ({
    postits: [],
    isEditting: [],
    exportDates: [
      moment().subtract(7, "days").format("YYYY-MM-DD"),
      moment().format("YYYY-MM-DD"),
    ],
    expansionToggleOn: false,
  }),
  mounted() {
    ipcRenderer.send("setCompleted");
    ipcRenderer.on("completed", (event, completedPostits) => {
      this.postits = [...completedPostits].reverse();
      this.isEditting = new Array(completedPostits.length).fill(false);
    });
  },
  computed: {
    exportText: function () {
      if (this.exportDates.length === 2) {
        let output = "";
        const startDate = this.exportDates[0];
        const endDate = this.exportDates[1];
        this.postits.forEach((item) => {
          if (item.date && item.date >= startDate && item.date <= endDate) {
            console.log(item);
            output += `[${item.date}] ${item.text}\n`;
          }
        });
        return output;
      } else {
        return "종료일을 선택해주세요";
      }
    },
  },
  methods: {
    copyToClipboard: function () {
      const targetItem = this.$refs.exportTextArea;
      console.log(targetItem);
      targetItem.select();
      document.execCommand("copy");
    },
    expansionToggle: function (e) {
      this.expansionToggleOn = !this.expansionToggleOn;
    },
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
    endEditting: function (index) {
      this.$set(this.isEditting, index, false);
      this.postits[index] = setCategory(this.postits[index]);
      console.log(this.postits[index]);
      ipcRenderer.send("saveCompleted", [...this.postits].reverse());
      console.log("ended editting", index);
    },
    startEditting: function (index) {
      this.$set(this.isEditting, index, true);
      const targetItem = this.$refs.postitTextarea[index];
      setTimeout(function () {
        targetItem.focus();
      }, 0);
      console.log("started editting", index);
    },
    remove: function (index) {
      deleteSound.play();
      const target = this.postits[index];
      this.postits.splice(index, 1);
      this.isEditting.splice(index, 1);
      ipcRenderer.send("saveCompleted", [...this.postits].reverse());
      ipcRenderer.send("addToDeletedAndSave", target);
    },
  },
};
</script>

<style lang="scss">
@import "../assets/common";
.expansion-panel {
  margin: 10px;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2),
    0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  .expansion-panel-header {
    padding: 5px;
    margin-top: 6px;
    position: relative;

    .expand-more-icon {
      width: 22px;
      position: absolute;
      right: 10px;
      transition: all 0.3s linear;
      &.isToggled {
        transform: rotate(-180deg);
      }
    }
  }
  .expansion-panel-body {
    margin-top: 10px;
    height: 0px;
    opacity: 0;
    transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    position: relative;

    &.isToggled {
      height: 300px;
      opacity: 1;
      display: block;
    }

    .export-textarea {
      padding: 10px 20px;
      width: 100%;
      height: 290px;
      background: #fdfad2;
    }

    .copy-button {
      position: absolute;
      bottom: 12px;
      right: 10px;
      background: #fed054;
    }
  }
}
.postit-button-area {
  position: absolute;
  bottom: 10px;
  right: 14px;
}
</style>
