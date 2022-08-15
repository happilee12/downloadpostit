<template>
  <v-container class="main-container" style="margin-top: 30px;">
      <BarChart />

  </v-container>
</template>

<script>
const { ipcRenderer } = require('electron')
import deleteSoundEffect from '../assets/delete.mp3'
const deleteSound = new Audio(deleteSoundEffect)
const moment = require('moment')
import BarChart from './BarChart.vue'


export default {
    name: 'CompletedBoard',
    components: { BarChart },
    data: () => ({
      postits: [],
      isEditting: [],
      exportDates: [moment().subtract(7, "days").format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")],
      expansionToggleOn: false
    }),
    mounted() {
      ipcRenderer.send('setCompleted')
      ipcRenderer.on('completed', (event, completedPostits) => {
        this.postits = completedPostits
        this.isEditting = new Array(completedPostits.length).fill(false);
      })
    },
    computed: {
      exportText: function () {
        if(this.exportDates.length === 2) {
          let output = ""
          const startDate = this.exportDates[0]
          const endDate = this.exportDates[1]
          this.postits.forEach(item => {
            if(item.date && item.date >= startDate && item.date<=endDate){
              console.log(item)
              output += `[${item.date}] ${item.text}\n`
            }
          })
          return output
        } else {
          return "종료일을 선택해주세요"
        }
      }
    },
    methods: {
      copyToClipboard: function() {
          const targetItem = this.$refs.exportTextArea;
          console.log(targetItem)
          targetItem.select();
          document.execCommand('copy');
      },
      expansionToggle: function(e){
        this.expansionToggleOn = !this.expansionToggleOn
      },
      handleTabInput: function(e){
        if (e.key == 'Tab') {
          e.preventDefault();
          const targetTextArea = e.target
          var start = targetTextArea.selectionStart;
          var end = targetTextArea.selectionEnd;

          // set textarea value to: text before caret + tab + text after caret
          targetTextArea.value = targetTextArea.value.substring(0, start) +
            "\t" + targetTextArea.value.substring(end);

          // put caret at right position again
          targetTextArea.selectionStart = targetTextArea.selectionEnd = start + 1;
        }
      },
      endEditting: function(index){
        this.$set(this.isEditting, index, false)
        ipcRenderer.send('saveCompleted', this.postits)
        console.log("ended editting", index);
      },
      startEditting: function(index){
        this.$set(this.isEditting, index, true)
        const targetItem = this.$refs.postitTextarea[index];
        setTimeout(function() { targetItem.focus()}, 0);
        console.log("started editting", index);
      },
      remove: function (index) {
        deleteSound.play()
        const target = this.postits[index]
        this.postits.splice(index, 1)
        this.isEditting.splice(index, 1)
        ipcRenderer.send('saveCompleted', this.postits)
        ipcRenderer.send('addToDeletedAndSave', target)
      }
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