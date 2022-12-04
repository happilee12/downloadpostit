<template>
  <v-card class="postit-card mx-auto">
    <v-card-subtitle class="pb-0">
      {{ memoObject.createdAt }} ~ {{ memoObject.completedAt || "" }}
    </v-card-subtitle>
    <textarea
      class="postit-editting-textarea"
      :ref="'postitTextarea'"
      @focus="startEditting"
      @blur="endEditting"
      @keydown="handleTabInput"
      v-model="memoObject.text"
      placeholder="메모할 내용을 입력하세요."
    ></textarea>
    <v-row class="postit-button-area" v-if="!isEditting">
      <v-card-actions>
        <v-btn
          color="primary"
          text
          v-if="memoObject.status != this.MemoStatus.DELETED"
          @click="remove(id)"
        >
          삭제
        </v-btn>
        <v-btn
          color="primary"
          text
          v-if="memoObject.status == this.MemoStatus.TODO"
          @click="complete(id)"
        >
          완료
        </v-btn>
        <v-btn
          color="primary"
          text
          @click="removeCompletely(id)"
          v-if="memoObject.status == this.MemoStatus.DELETED"
        >
          완전삭제
        </v-btn>
      </v-card-actions>
    </v-row>
  </v-card>
</template>

<script>
import { setCategory, Memo } from "@/js/memo";
import { MemoStatus } from "@/js/constants";

export default {
  name: "Memo",
  props: {
    id: {
      type: String,
    },
    memoObject: {
      type: Object,
      default: {
        text: "",
        createdAt: "",
        completedAt: "",
      },
    },
    remove: {
      type: Function,
    },
    complete: {
      type: Function,
    },
    removeCompletely: {
      type: Function,
    },
  },
  data: () => ({
    isEditting: false,
    memoInstance: {},
    MemoStatus: MemoStatus,
  }),
  mounted() {
    // this.memoInstance = new Memo();
    // console.log("memoInstance", this.memoInstance);
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
    startEditting: function () {
      this.isEditting = true;
      console.log("start Editting", this.id);
    },
    endEditting: function () {
      this.isEditting = false;
      this.memoObject = setCategory(this.memoObject);
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
