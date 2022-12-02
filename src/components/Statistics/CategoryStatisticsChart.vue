<template>
  <v-container class="main-container" style="margin-top: 30px">
    <BarChart chartId="weeklyWorkload" :chartData="lineChartData" />
  </v-container>
</template>

<script>
import BarChart from "@/components/VueChart/BarChart.vue";
import {
  getDateListInBetween,
  getMemoCountDataset,
} from "@/js/categoryStstisticsChart";
export default {
  name: "CategoryStatisticsChart",
  components: { BarChart },
  props: {
    memoList: {
      type: Array,
    },
    dateRange: {
      type: Array,
      default: [],
    },
  },
  data: () => ({}),
  mounted() {},
  computed: {
    lineChartData: function () {
      try {
        const dateList = getDateListInBetween(
          this.dateRange[0],
          this.dateRange[1]
        );
        const datasets = getMemoCountDataset(this.memoList, dateList);
        return {
          labels: dateList,
          datasets,
        };
      } catch (e) {
        console.log(e);
        return {
          labels: [],
          datasets: [],
        };
      }
    },
  },
  methods: {},
};
</script>

<style lang="scss"></style>
