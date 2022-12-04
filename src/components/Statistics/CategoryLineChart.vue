<template>
  <v-container>
    <LineChart :chartId="chartId" :chartData="lineChartData" />
  </v-container>
</template>

<script>
import LineChart from "@/components/VueChart/LineChart.vue";
import {
  getDateListInBetween,
  getTimeSeriesCetegoryCountDataset,
} from "@/js/categoryStstisticsChart";
export default {
  name: "CategoryLineChart",
  components: { LineChart },
  props: {
    chartId: {
      type: String,
      default: "categoryLineChart",
    },
    memoItems: {
      type: Array,
    },
    dateRange: {
      type: Array,
      default: [],
    },
  },
  computed: {
    lineChartData: function () {
      try {
        const dateList = getDateListInBetween(
          this.dateRange[0],
          this.dateRange[1]
        );
        const datasets = getTimeSeriesCetegoryCountDataset(
          this.memoItems,
          dateList
        );
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
};
</script>

<style lang="scss"></style>
