<template>
  <v-container mt-5>
    <!-- 타이틀 영역 -->
    <v-container>
      <v-container d-flex justify-center>
        <v-btn-toggle v-model="dateRangeOption" mandatory>
          <v-btn> 1W </v-btn>
          <v-btn> 1M </v-btn>
          <v-btn> 3M </v-btn>
          <v-btn> 6M </v-btn>
          <v-btn> 1Y </v-btn>
        </v-btn-toggle>
      </v-container>

      <div>{{ dateRange[0] }}~{{ dateRange[1] }}</div>
      <div>
        # of Memos :
        {{ memoItems.length }}
      </div>
    </v-container>

    <!-- 카테고리별 비중 -->
    <v-container>
      <h1>📈 Categories</h1>
      <v-container mt-3 mb-5 pa-8 class="data-area">
        <CategoryPieChart :memoItems="memoItems" :dateRange="dateRange" />
      </v-container>
    </v-container>

    <!-- 일자별 카테고리 메모 수 -->
    <v-container>
      <h1>📈 Daily Changes</h1>
      <v-container mt-3 mb-5 pa-8 class="data-area">
        <CategoryLineChart
          chartId="categoryLineChart"
          :memoItems="memoItems"
          :dateRange="dateRange"
        />
      </v-container>
    </v-container>

    <!-- 전체 내용 -->
    <v-container>
      <h1>📜 Timeline</h1>
      <v-container mt-3 mb-5 pa-5 class="data-area">
        <Summary :memoItems="memoItems" />
      </v-container>
    </v-container>
  </v-container>
</template>

<script>
const { ipcRenderer } = require("electron");
const moment = require("moment");

import CategoryLineChart from "@/components/Statistics/CategoryLineChart.vue";
import CategoryPieChart from "@/components/Statistics/CategoryPieChart.vue";
import Summary from "@/components/Statistics/Summary.vue";

export default {
  name: "StatisticsBoard",
  components: { CategoryLineChart, CategoryPieChart, Summary },
  data: () => ({
    dateRangeOption: undefined,
    dateRange: [
      moment().subtract(7, "d").format("YYYY-MM-DD"),
      moment().add(1, "d").format("YYYY-MM-DD"),
    ],
    allMemos: [],
  }),
  mounted() {
    ipcRenderer.send("setAllBoard");
    ipcRenderer.once("allBoard", (event, allMemos) => {
      this.allMemos = allMemos;
      this.dateRangeOption = 0;
      console.log(this.allMemos);
    });
  },
  computed: {
    memoItems: function () {
      // 기간 범위 내의 completed 메모 구성
      const targetCompletedMemoItems = {};
      this.allMemos.completed &&
        Object.keys(this.allMemos.completed).forEach((memoId) => {
          const memoObject = this.allMemos.completed[memoId];
          if (
            (memoObject.createdAt >= this.dateRange[0] &&
              memoObject.createdAt < this.dateRange[1]) ||
            (memoObject.completedAt >= this.dateRange[0] &&
              memoObject.completedAt < this.dateRange[1])
          ) {
            targetCompletedMemoItems[memoId] = memoObject;
          }
        });

      return Object.values({
        ...this.allMemos.todo,
        ...targetCompletedMemoItems,
      });
    },
  },
  watch: {
    dateRangeOption: {
      handler(value, oldValue) {
        switch (value) {
          case 0:
            this.dateRange = [
              moment().subtract(7, "d").format("YYYY-MM-DD"),
              moment().add(1, "d").format("YYYY-MM-DD"),
            ];
            break;
          case 1:
            this.dateRange = [
              moment().subtract(1, "M").format("YYYY-MM-DD"),
              moment().add(1, "d").format("YYYY-MM-DD"),
            ];
            break;
          case 2:
            this.dateRange = [
              moment().subtract(3, "M").format("YYYY-MM-DD"),
              moment().add(1, "d").format("YYYY-MM-DD"),
            ];
            break;
          case 3:
            this.dateRange = [
              moment().subtract(6, "M").format("YYYY-MM-DD"),
              moment().add(1, "d").format("YYYY-MM-DD"),
            ];
            break;
          case 4:
            this.dateRange = [
              moment().subtract(1, "y").format("YYYY-MM-DD"),
              moment().add(1, "d").format("YYYY-MM-DD"),
            ];
            break;
        }
      },
    },
  },
};
</script>

<style lang="scss">
@import "../assets/common";

.data-area {
  background-color: white;
  border-radius: 5px;
}
</style>
