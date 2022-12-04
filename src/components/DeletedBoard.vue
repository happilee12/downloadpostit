<template>
  <v-container mt-5>
    <v-row dense justify-content="start">
      <v-col
        cols="12"
        sm="6"
        md="4"
        lg="3"
        v-for="(memoObject, id) in memoItems"
        :key="`postit-` + id"
      >
        <Memo
          :id="id"
          :memoObject="memoObject"
          :idEditting="false"
          :removeCompletely="removeCompletely"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const { ipcRenderer } = require("electron");
import deleteSoundEffect from "../assets/delete.mp3";
const deleteSound = new Audio(deleteSoundEffect);
import Memo from "@/components/Memo.vue";

export default {
  name: "DeletedBoard",
  components: { Memo },

  data: () => ({
    memoItems: {},
  }),
  mounted() {
    ipcRenderer.send("setDeletedBoard");
    ipcRenderer.once("deletedBoard", (event, deletedPostits) => {
      this.memoItems = deletedPostits;
    });
  },
  computed: {},
  methods: {
    removeCompletely: function (memoId) {
      console.log();
      deleteSound.play();
      this.$delete(this.memoItems, memoId); // 화면에서 삭제
      ipcRenderer.send("deleteFromDeleted", memoId); // 데이터 업데이트
    },
  },
};
</script>

<style lang="scss">
@import "../assets/common";

.postit-textbox {
  width: 100%;
  height: 250px;
  padding: 50px 15px 0 15px;
  position: absolute;
  top: 0px;
}
.postit-button-area {
  position: absolute;
  bottom: 10px;
  right: 14px;
}
</style>
