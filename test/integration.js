const path = require("path");
const { tests } = require("@iobroker/testing");

tests.integration(path.join(__dirname, ".."), {
  defineAdditionalTests({ suite }) {
    suite("Adapter startup without GitHub credentials configured", (getHarness) => {
      let harness;
      before(() => {
        harness = getHarness();
      });

      it("should start and stay running (graceful degradation)", async () => {
        await harness.startAdapterAndWait();

        const isRunning = await harness.isAdapterRunning();
        if (!isRunning) {
          throw new Error("Adapter is not running after startAdapterAndWait()");
        }
      }).timeout(60000);
    });
  },
});
