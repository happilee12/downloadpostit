<template>
  <v-container mt-5>
    <v-row class="d-flex flex-row-reverse">
      <v-btn text primary @click="redirectToDeleted">
        Manage deleted <v-icon>mdi-delete</v-icon>
      </v-btn>
    </v-row>
    <v-row class="filter-handler-row">
      <v-col cols="12" md="9" xs="12">
        <v-text-field v-model="searchText" label="Search" solo></v-text-field>
      </v-col>
      <v-col cols="12" md="3" xs="12">
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
        v-for="([id, memoObject], index) in Object.entries(memoItems).reverse()"
        :key="`postit-` + id"
      >
        <Memo
          :id="id"
          :memoObject="memoObject"
          :idEditting="false"
          :remove="remove"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const { ipcRenderer } = require("electron");
import deleteSoundEffect from "../assets/delete.mp3";
import Memo from "@/components/Memo.vue";
const deleteSound = new Audio(deleteSoundEffect);
const ALL = "ALL";
import { filterObjectValues, getTimestamp } from "@/js/common";
import { MemoStatus } from "@/js/constants";

export default {
  name: "AllBoard",
  components: { Memo },
  data: () => ({
    memoStatusAll: {},
    searchText: "",
    subCategory: "",
  }),
  mounted() {
    ipcRenderer.send("setAllBoard");
    ipcRenderer.once("allBoard", (event, allMemos) => {
      this.memoStatusAll = {
        ...allMemos.completed,
        ...allMemos.todo,
      };
    });
  },
  computed: {
    categoryList: function () {
      const categoryListAll = Object.values(this.memoStatusAll).map(
        (item) => item.subCategory
      );
      return [ALL, ...new Set(categoryListAll)].filter((item) => item);
    },
    /** 화면에 노출할 메모 */
    memoItems: function () {
      /** filter by selected category */
      let categoryFiltered;
      if (!this.subCategory || !this.memoStatusAll || this.subCategory == ALL) {
        categoryFiltered = this.memoStatusAll;
      } else {
        categoryFiltered = filterObjectValues(
          this.memoStatusAll,
          (objectItem) => {
            return objectItem.subCategory == this.subCategory;
          }
        );
      }

      /** filter by searchKeyword */
      if (!this.searchText) return categoryFiltered;
      else {
        console.log(this.searchText);
        return filterObjectValues(categoryFiltered, (objectItem) => {
          return objectItem.text.includes(this.searchText);
        });
      }
    },
  },
  methods: {
    remove: function (memoId) {
      deleteSound.play();
      const targetMemo = this.memoStatusAll[memoId];
      /** 화면에서 삭제 */
      this.$delete(this.memoStatusAll, memoId);
      if (targetMemo.status == MemoStatus.TODO) {
        ipcRenderer.send("deleteFromTodos", memoId);
      } else if (targetMemo.status == MemoStatus.COMPLETED) {
        ipcRenderer.send("deleteFromCompleted", memoId);
      }
      ipcRenderer.send("addToDeletedAndSave", memoId, {
        ...targetMemo,
        status: MemoStatus.DELETED,
        ...getTimestamp("deleted"),
      });
    },
    redirectToDeleted() {
      this.$router.push({ name: "Deleted" }).catch(() => {});
    },
  },
};
</script>

<style lang="scss">
.filter-handler-row {
  margin-top: 30px !important;
  // 검색/필터 하단의 공백 제거
  .v-text-field.v-text-field--enclosed .v-text-field__details {
    display: none;
  }
}
</style>
