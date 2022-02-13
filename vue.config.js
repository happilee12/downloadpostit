module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
        nodeIntegration: true,
        builderOptions: {
          productName: "POSTit",
          appId: 'com.electron.postit',
          copyright: 'Copyright © 2022 Leekyeung Han',
          "mac": {
            "icon": "./public/icon.png",
          },
          win: {
              "target": [
                  "nsis"
              ],
            icon: './public/icon.ico',
          },
          "nsis": {
              "installerIcon": "./public/icon.ico",
              "uninstallerIcon": "./public/favicon.ico",
          }
        }
    }
  }
}
