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
        v-for="(memoObject, id) in memoItems"
        :key="`postit-` + id"
      >
        <Memo
          :id="id"
          :memoObject="memoObject"
          :idEditting="false"
          :remove="remove"
        />
        <!-- <v-card class="postit-card mx-auto">
          <v-card-subtitle class="pb-0">
            # {{ index }} {{ postit.completedAt || "" }}
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
        </v-card> -->
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
import { setCategory } from "@/js/memo";

export default {
  name: "AllBoard",
  components: { Memo },
  data: () => ({
    allMemoItems: [],
    searchText: "",
    subCategory: "",
  }),
  mounted() {
    ipcRenderer.send("setCompleted");
    ipcRenderer.on("completed", (event, completedPostits) => {
      this.allMemoItems = completedPostits;
      console.log("this.allMemoItems", this.allMemoItems);
    });
  },
  computed: {
    categoryList: function () {
      return [
        ALL,
        ...new Set(
          Object.entries(this.allMemoItems).map((item) => item.subCategory)
        ),
      ].filter((item) => item);
    },
    /** 화면에 노출할 메모 */
    memoItems: function () {
      console.log("this.allMemoItems", this.allMemoItems);
      /** filter by selected category */
      let categoryFiltered;
      if (!this.subCategory || !this.allMemoItems || this.subCategory == ALL) {
        categoryFiltered = this.allMemoItems;
      } else {
        categoryFiltered = this.allMemoItems.filter(
          (item) => item.subCategory == this.subCategory
        );
      }

      console.log("categoryFiltered", categoryFiltered);
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
    remove: function (memoId) {
      deleteSound.play();
      const targetMemo = this.memoItems[memoId];
      this.$delete(this.memoItems, memoId);
      ipcRenderer.send("saveCompleted", this.memoItems);
      ipcRenderer.send("addToDeletedAndSave", targetMemo);
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
