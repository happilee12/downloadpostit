<template>
  <v-container mt-5>
    <v-row dense align="center" justify="center" style="height: 60px">
      <v-btn
        class="new-postit-btn"
        elevation="3"
        color="secondary"
        @click="newPostit"
        >Add Memo
      </v-btn>
    </v-row>
    <v-row style="width: 100%" dense justify-content="start" v-if="memoItems">
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="3"
        v-for="(memoObject, id) in memoItems"
        :key="`memoObject-` + id"
      >
        <Memo
          :id="id"
          :memoObject="memoObject"
          :idEditting="false"
          :remove="remove"
          :complete="complete"
        />
      </v-col>
    </v-row>
    <v-row v-else><Welcome></Welcome></v-row>
  </v-container>
</template>

<script>
import Welcome from "./Welcome.vue";
const { ipcRenderer } = require("electron");
const moment = require("moment");
import Memo from "@/components/Memo.vue";
import popSoundEffect from "../assets/pop.mp3";
import completeSoundEffect from "../assets/complete.mp3";
import deleteSoundEffect from "../assets/delete.mp3";
import { MemoStatus } from "@/js/constants";
import { getTimestamp } from "@/js/common";

const popSound = new Audio(popSoundEffect);
const completeSound = new Audio(completeSoundEffect);
const deleteSound = new Audio(deleteSoundEffect);

export default {
  components: { Welcome, Memo },
  name: "Board",
  data: () => ({
    memoItems: {},
    memoInstance: {},
  }),
  mounted() {
    ipcRenderer.send("setTodoBoard");
    ipcRenderer.once("todoBoard", (event, todos) => {
      this.memoItems = todos;
      console.log("this.postits", this.memoItems);
    });
  },
  computed: {},
  methods: {
    newPostit: function () {
      popSound.play();
      const newMemoId = moment().valueOf();
      this.$set(this.memoItems, newMemoId, {
        text: "",
        ...getTimestamp("created"),
        status: MemoStatus.TODO,
      });
      ipcRenderer.send("saveTodos", this.memoItems);
    },
    remove: function (memoId) {
      deleteSound.play();
      ipcRenderer.send("addToDeletedAndSave", memoId, {
        ...this.memoItems[memoId],
        status: MemoStatus.DELETED,
        ...getTimestamp("deleted"),
      }); // deleted 데이터에 추가
      this.$delete(this.memoItems, memoId); // 화면에서 삭제
      ipcRenderer.send("deleteFromTodos", memoId); // To-do 데이터에서 삭제
    },
    complete: function (memoId) {
      completeSound.play();
      ipcRenderer.send("addToCompletedAndSave", memoId, {
        ...this.memoItems[memoId],
        status: MemoStatus.COMPLETED,
        ...getTimestamp("completed"),
      }); // completed 데이터에 추가
      this.$delete(this.memoItems, memoId); // 화면에서 삭제
      ipcRenderer.send("deleteFromTodos", memoId); // To-do 데이터에서 삭제
    },
  },
};
</script>

<style lang="scss">
@import "../assets/common";

.new-postit-btn {
  background: #8a7bb5;
}

.postit-button-area {
  position: absolute;
  bottom: 10px;
  right: 14px;
}
</style>
