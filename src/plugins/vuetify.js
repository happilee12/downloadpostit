import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
          light: {
            primary: '#3B4046',
            secondary: '#2A2F35',
            yellow: '#FED054',
            light: '#FDFAD2',
            accent: '#8c9eff',
            error: '#b71c1c',
          },
        },
      },
});
