<template>
  <v-container class="main-container">
    <v-row dense align="center" justify="center" style="height: 60px;">
      <v-btn class="new-postit-btn" elevation="3" color="secondary" @click="newPostit">새 포스트잇 🎀 </v-btn>
    </v-row>
    <v-row style="width: 100%" dense justify-content="start" v-if="postits.length > 0">
      <v-col
        cols="12" sm="6" md="4" lg="3"
        v-for="(postit, index) in postits" :key="`postit-`+index"
      >
        <v-card class="postit-card mx-auto">
          <textarea 
            class="postit-editting-textarea" :ref="'postitTextarea'"
            @focus="startEditting(index)"
            @blur="endEditting(index)"
            @keydown="handleTabInput"
            v-model="postit.text" placeholder="새 포스트잇"
          ></textarea>
          <v-card-subtitle class="pb-0">
            # {{index}}
          </v-card-subtitle>
          <v-row class="postit-button-area" v-if="!isEditting[index]">
            <v-card-actions>
              <v-btn color="primary" text @click="remove(index)"> 삭제 </v-btn>
              <v-btn color="primary" text @click="complete(index)"> 완료 </v-btn>
            </v-card-actions>
          </v-row> 
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else><Welcome></Welcome></v-row>
  </v-container>
</template>

<script>
import Welcome from './Welcome.vue'
const { ipcRenderer } = require('electron')
const moment = require('moment')
import popSoundEffect from '../assets/pop.mp3'
import completeSoundEffect from '../assets/complete.mp3'
import deleteSoundEffect from '../assets/delete.mp3'
 const popSound = new Audio(popSoundEffect)
 const completeSound = new Audio(completeSoundEffect)
 const deleteSound = new Audio(deleteSoundEffect)

export default {
  components: { Welcome },
    name: 'Board',
    data: () => ({
      postits: [],
      isEditting: [],
    }),
    mounted() {
      ipcRenderer.send('setTodos')
      ipcRenderer.on('todos', (event, todos) => {
        this.postits = todos
        this.isEditting = new Array(todos.length).fill(false);
      })
    },
    computed: {
    },
    methods: {
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
        ipcRenderer.send('saveTodos', this.postits)
      },
      startEditting: function(index){
        this.$set(this.isEditting, index, true)
        const targetItem = this.$refs.postitTextarea[index];
        setTimeout(function() { targetItem.focus()}, 0);
      },
      newPostit: function(){
        popSound.play()
        this.postits.push({ "text" : "" })
        this.isEditting.push(false)
        ipcRenderer.send('saveTodos', this.postits)
      },
      remove: function (index) {
        deleteSound.play()
        const target = this.postits[index]
        target.date = moment().format("YYYY-MM-DD");
        this.postits.splice(index, 1)
        this.isEditting.splice(index, 1)
        ipcRenderer.send('saveTodos', this.postits)
        ipcRenderer.send('addToDeletedAndSave', target)
      },
      complete: function (index) {
        completeSound.play()
        const target = this.postits[index]
        target.date = moment().format("YYYY-MM-DD");
        this.postits.splice(index, 1)
        this.isEditting.splice(index, 1)
        ipcRenderer.send('saveTodos', this.postits)
        ipcRenderer.send('addToCompletedAndSave', target)
      }
    }

  }
</script>


<style lang="scss">
@import "../assets/common";

.new-postit-btn{
  background: #8A7BB5;
}

.postit-button-area{
  position: absolute;
  bottom: 10px;
  right: 14px;
}
</style>