const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: '2ne2xr',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
