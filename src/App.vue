<template>
  <v-app class="main-background">
    <v-app-bar app dark color="primary">
      <v-tabs class="tabs" centered>
        <v-tab @click="redirectToHome">메모 보드</v-tab>
        <v-tab @click="redirectToCompleted">히스토리</v-tab>
        <v-tab @click="redirectToStatistics">통계</v-tab>
      </v-tabs>
      <v-btn @click="redirectToDeleted" icon><v-icon>mdi-delete</v-icon></v-btn>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data: () => ({}),
  methods: {
    redirectToHome() {
      this.$router.push({ name: "Home" }).catch(() => {});
    },
    redirectToCompleted() {
      this.$router.push({ name: "Completed" }).catch(() => {});
    },
    redirectToDeleted() {
      this.$router.push({ name: "Deleted" }).catch(() => {});
    },
    redirectToStatistics() {
      this.$router.push({ name: "Statistics" }).catch(() => {});
    },
  },
};
</script>

<style lang="scss">
.tabs {
  padding-left: 62px;
}

.main-background {
  background-color: #eeebf0 !important;
}

.postit-card {
  height: 300px;
  width: 300px;
  background-color: #fed054 !important;
}

.postit-editting-textarea {
  width: 100%;
  height: 200px;
  margin-top: 50px;
  padding: 0px 15px 0 15px;
  position: absolute;
  top: 0px;
}
</style>
