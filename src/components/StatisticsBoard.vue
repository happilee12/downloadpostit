<template>
  <v-container class="main-container" style="margin-top: 30px;">
    {{this.targetpostits}}
    {{this.dailyPostitCount}}
    <v-row justify="center">
      <v-btn-toggle
        v-model="dateRangeOption"
        mandatory
      >
        <v-btn>
          1W
        </v-btn>
        <v-btn>
          1M
        </v-btn>
        <v-btn>
          6M
        </v-btn>
        <v-btn>
          1Y
        </v-btn>
      </v-btn-toggle>
    </v-row>
    <v-row justify="center">
      <h1> {{dateRange[0]}}~{{dateRange[1]}} </h1>
    </v-row>
      <h2>요약</h2>
      <v-sheet
        elevation="1"
        height="300"
        width="100%"
        rounded
      ></v-sheet>
      <h2>카테고리 통계</h2>
      <v-container p-1>
        <v-row>
          <v-col md="6" p-10>
            <PieChart 
            chartId="category" 
            :chartData="{
                labels: ['메인', '검색', '운영', '기타'],
                datasets: [
                  {
                    backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
                    data: [40, 20, 80, 10]
                  }
                ]
              }"/>
          </v-col>
          <v-col md="6">
            <PieChart 
            chartId="category" 
            :chartData="{
                labels: ['메인', '검색.데이터덤프', '운영.TID이관', '기타'],
                datasets: [
                  {
                    backgroundColor: ['#41B883', '#E46651', '#00D8FF', '#DD1B16'],
                    data: [40, 20, 80, 10]
                  }
                ]
              }"/>
          </v-col>
        </v-row>
      </v-container>
      

      <h2>일자 통계</h2>
      <BarChart 
        chartId="weeklyWorkload" 
        :chartData="{
            labels: this.dailyPostitCount[0],
            datasets: [
                {
                    backgroundColor: '#f87979',
                    data: this.dailyPostitCount[1]
                }
            ]
        }"/>


  </v-container>
</template>

<script>
const { ipcRenderer } = require('electron')
import deleteSoundEffect from '../assets/delete.mp3'
const deleteSound = new Audio(deleteSoundEffect)
const moment = require('moment')
import BarChart from './BarChart.vue'
import PieChart from './PieChart.vue'


export default {
    name: 'StatisticsBoard',
    components: { BarChart, PieChart },
    data: () => ({
      dateRangeOption: undefined,
      dateRange: [moment().subtract(7,'d').format('YYYY-MM-DD'), moment().add(1,'d').format("YYYY-MM-DD")],
      allPostits: []
    }),
    mounted() {
      ipcRenderer.send('setAll')
      ipcRenderer.on('all', (event, allPostits) => {
        this.allPostits = allPostits
        this.dateRangeOption = 0
        console.log(this.allPostits)
      })
    },
    computed: {
      targetpostits: function () {
        return (this.allPostits.todo ? this.allPostits.todo : [])
            .concat( this.allPostits.deleted ? this.allPostits.deleted.filter(p => (p.createdAt >= this.dateRange[0] && p.createdAt < this.dateRange[1] ) || (p.date >= this.dateRange[0] && p.date < this.dateRange[1] )) : [])
            .concat( this.allPostits.completed ? this.allPostits.completed.filter(p => (p.createdAt >= this.dateRange[0] && p.createdAt < this.dateRange[1] ) || (p.date >= this.dateRange[0] && p.date < this.dateRange[1] )) : [])
      },
      dailyPostitCount: function() {
        if(!this.dateRange[0]) return (undefined, undefined)
        let targetDate = this.dateRange[0]
        let dateList = []
        let countList = []
        while(targetDate < this.dateRange[1]){
          dateList.push(targetDate)
          const postitsAtDate = this.targetpostits.filter(p => {
            if(p.createdAt > targetDate) return false
            if(p.date && p.date < targetDate) return false
            return true
          })
          countList.push(postitsAtDate.length)
          targetDate = moment(targetDate).add(1, 'd').format("YYYY-MM-DD")
        }
        return [dateList, countList]
      }
    },
    methods: {
    },
    watch: {
      'dateRangeOption': {
        handler(value, oldValue) {
          switch(value){
            case 0:
              this.dateRange = [moment().subtract(7,'d').format('YYYY-MM-DD'), moment().add(1,'d').format("YYYY-MM-DD")]
              break
            case 1:
              this.dateRange = [moment().subtract(1, 'M').format('YYYY-MM-DD'), moment().add(1,'d').format("YYYY-MM-DD")]
              break
            case 2:
              this.dateRange = [moment().subtract(6, 'M').format('YYYY-MM-DD'), moment().add(1,'d').format("YYYY-MM-DD")]
              break
            case 3:
              this.dateRange = [moment().subtract(1,'y').format('YYYY-MM-DD'), moment().add(1,'d').format("YYYY-MM-DD")]
              break
          }
        },
      },
    }

  }
</script>


<style lang="scss">
@import "../assets/common";
.expansion-panel{
  margin: 10px;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  .expansion-panel-header{
    padding: 5px;
    margin-top: 6px;
    position: relative;
    
    .expand-more-icon{
      width: 22px;
      position: absolute;
      right: 10px;
      transition: all 0.3s linear;
      &.isToggled{
        transform: rotate( -180deg );
      }
    }
  }
  .expansion-panel-body{
    margin-top: 10px;
    height: 0px;
    opacity: 0;
    transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    position: relative;

    &.isToggled{
      height: 300px;
      opacity: 1;
      display: block;
    }

    .export-textarea{
      padding: 10px 20px;
      width: 100%;
      height: 290px;
      background: #FDFAD2;
    }

    .copy-button{
      position: absolute;
      bottom: 12px;
      right: 10px;
      background: #FED054;
    }
  }
}
.postit-button-area{
  position: absolute;
  bottom: 10px;
  right: 14px;
}
</style>