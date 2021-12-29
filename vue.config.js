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
            icon: './public/icon.png',
          },
          "nsis": {
              "installerIcon": "./public/icon.png",
              "uninstallerIcon": "./public/favicon.ico",
          }
        }
    }
  }
}
