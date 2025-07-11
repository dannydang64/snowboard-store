// Configuration for Jest Puppeteer
module.exports = {
  launch: {
    headless: process.env.HEADLESS !== 'false',
    slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO) : 0,
    defaultViewport: {
      width: 1280,
      height: 720
    },
    args: [
      '--window-size=1280,720',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  },
  browserContext: 'default'
};
