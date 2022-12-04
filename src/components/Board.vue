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
import popSoundEffect from "../assets/pop.mp3";
import completeSoundEffect from "../assets/complete.mp3";
import deleteSoundEffect from "../assets/delete.mp3";
import Memo from "@/components/Memo.vue";
import { MemoStatus } from "@/js/constants";
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
    ipcRenderer.send("setTodos");
    ipcRenderer.once("todos", (event, todos) => {
      this.memoItems = todos;
      console.log("this.postits", this.memoItems);
    });
    this.memoInstance = new Memo();
    console.log("memoInstance", this.memoInstance);
  },
  computed: {},
  methods: {
    newPostit: function () {
      popSound.play();
      const newMemoId = moment().valueOf();
      this.$set(this.memoItems, newMemoId, {
        text: "",
        createdAt: moment().format("YYYY-MM-DD"),
        createdAtDateTime: moment().format("YYYY-MM-DDTHH:mm:ss"),
        status: MemoStatus.TODO,
      });
      ipcRenderer.send("saveTodos", this.memoItems);
    },
    remove: function (memoId) {
      deleteSound.play();
      const todoObject = this.memoItems[memoId];
      this.$delete(this.memoItems, memoId);
      ipcRenderer.send("saveTodos", this.memoItems);
      ipcRenderer.send("addToDeletedAndSave", todoObject);
    },
    complete: function (memoId) {
      completeSound.play();
      const todoObject = this.memoItems[memoId];
      this.$delete(this.memoItems, memoId);
      ipcRenderer.send("saveTodos", this.memoItems);
      ipcRenderer.send("addToCompletedAndSave", todoObject);
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
