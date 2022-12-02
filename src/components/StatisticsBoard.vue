<template>
  <v-container class="main-container" style="margin-top: 30px">
    <v-row justify="center">
      <v-btn-toggle v-model="dateRangeOption" mandatory>
        <v-btn> 1W </v-btn>
        <v-btn> 1M </v-btn>
        <v-btn> 6M </v-btn>
        <v-btn> 1Y </v-btn>
      </v-btn-toggle>
    </v-row>
    <v-row justify="center">
      <h1>{{ dateRange[0] }}~{{ dateRange[1] }}</h1>
    </v-row>

    <h2>카테고리 통계</h2>
    <CategoryPieChart :memoList="targetpostits" :dateRange="dateRange" />

    <h2>일자 통계</h2>
    <CategoryLineChart
      chartId="categoryLineChart"
      :memoList="targetpostits"
      :dateRange="dateRange"
    />

    <h2>요약</h2>
    <v-sheet elevation="1" height="300" width="100%" rounded></v-sheet>
  </v-container>
</template>

<script>
const { ipcRenderer } = require("electron");
const moment = require("moment");

import CategoryLineChart from "@/components/Statistics/CategoryLineChart.vue";
import CategoryPieChart from "@/components/Statistics/CategoryPieChart.vue";

export default {
  name: "StatisticsBoard",
  components: { CategoryLineChart, CategoryPieChart },
  data: () => ({
    dateRangeOption: undefined,
    dateRange: [
      moment().subtract(7, "d").format("YYYY-MM-DD"),
      moment().add(1, "d").format("YYYY-MM-DD"),
    ],
    allPostits: [],
  }),
  mounted() {
    ipcRenderer.send("setAll");
    ipcRenderer.on("all", (event, allPostits) => {
      this.allPostits = allPostits;
      this.dateRangeOption = 0;
      console.log(this.allPostits);
    });
  },
  computed: {
    targetpostits: function () {
      return (this.allPostits.todo ? this.allPostits.todo : [])
        .concat(
          this.allPostits.deleted
            ? this.allPostits.deleted.filter(
                (p) =>
                  (p.createdAt >= this.dateRange[0] &&
                    p.createdAt < this.dateRange[1]) ||
                  (p.date >= this.dateRange[0] && p.date < this.dateRange[1])
              )
            : []
        )
        .concat(
          this.allPostits.completed
            ? this.allPostits.completed.filter(
                (p) =>
                  (p.createdAt >= this.dateRange[0] &&
                    p.createdAt < this.dateRange[1]) ||
                  (p.date >= this.dateRange[0] && p.date < this.dateRange[1])
              )
            : []
        );
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
              moment().subtract(6, "M").format("YYYY-MM-DD"),
              moment().add(1, "d").format("YYYY-MM-DD"),
            ];
            break;
          case 3:
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
</style>
