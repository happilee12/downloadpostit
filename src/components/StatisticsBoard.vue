<template>
  <v-container mt-5>
    <v-container>
      <v-container d-flex justify-center>
        <v-btn-toggle v-model="dateRangeOption" mandatory>
          <v-btn> 1W </v-btn>
          <v-btn> 1M </v-btn>
          <v-btn> 6M </v-btn>
          <v-btn> 1Y </v-btn>
        </v-btn-toggle>
      </v-container>

      <div>{{ dateRange[0] }}~{{ dateRange[1] }}</div>
      <div>
        # of Memos :
        {{ targetpostits.length }}
      </div>
    </v-container>

    <v-container>
      <h1>📈 Categories</h1>
      <v-container mt-3 mb-5 pa-8 class="data-area">
        <CategoryPieChart :memoList="targetpostits" :dateRange="dateRange" />
      </v-container>
    </v-container>

    <v-container>
      <h1>📈 Daily Changes</h1>
      <v-container mt-3 mb-5 pa-8 class="data-area">
        <CategoryLineChart
          chartId="categoryLineChart"
          :memoList="targetpostits"
          :dateRange="dateRange"
        />
      </v-container>
    </v-container>

    <v-container>
      <h1>📜 Summary</h1>
      <v-container mt-3 mb-5 pa-5 class="data-area"> </v-container>
    </v-container>
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

.data-area {
  background-color: white;
  border-radius: 5px;
}
</style>
