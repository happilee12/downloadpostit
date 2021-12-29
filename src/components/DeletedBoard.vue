<template>
  <v-container class="main-container" style="margin-top: 30px;">
    <v-row dense justify-content="start">
      <v-col
        cols="12" sm="6" md="4" lg="3"
        v-for="(postit, index) in postits" :key="`postit-`+index"
      >
        <v-card class="postit-card mx-auto">
          <v-card-subtitle class="pb-0" >
            # {{index}} {{postit.date ? postit.date : ''}}
          </v-card-subtitle>
          <div class="postit-textbox">{{postit.text}}</div>
          <v-row class="postit-button-area">
            <v-card-actions>
              <v-btn color="primary" text @click="removeCompletely(index)"> 완전삭제 </v-btn>
            </v-card-actions>
          </v-row> 
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const { ipcRenderer } = require('electron')
import deleteSoundEffect from '../assets/delete.mp3'
const deleteSound = new Audio(deleteSoundEffect)

export default {
    name: 'DeletedBoard',
    data: () => ({
      postits: [],
    }),
    mounted() {
      ipcRenderer.send('setDeleted')
      ipcRenderer.on('deleted', (event, deletedPostits) => {
        this.postits = deletedPostits
      })
    },
    computed: {
    },
    methods: {
      removeCompletely: function (index) {
        deleteSound.play()
        this.postits.splice(index, 1)
        ipcRenderer.send('saveDeleted', this.postits)
      }
    }

  }
</script>


<style lang="scss">
@import "../assets/common";

.postit-textbox{
  width: 100%;
  height: 250px;
  padding: 50px 15px 0 15px;
  position: absolute;
  top: 0px;
}
.postit-button-area{
  position: absolute;
  bottom: 10px;
  right: 14px;
}
</style>