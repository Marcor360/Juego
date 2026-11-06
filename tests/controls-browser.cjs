const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', headless: true, args: ['--no-sandbox', '--enable-unsafe-swiftshader']});
  try {
    for (const config of [
      {name: 'desktop', viewport: {width:1280,height:720}, hasTouch:false, isMobile:false},
      {name: 'small desktop', viewport: {width:667,height:375}, hasTouch:false, isMobile:false},
      {name: 'mobile landscape', viewport: {width:812,height:375}, hasTouch:true, isMobile:true},
      {name: 'mobile portrait', viewport: {width:390,height:844}, hasTouch:true, isMobile:true},
    ]) {
      const {name, ...options} = config;
      const context = await browser.newContext(options);
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(process.env.GAME_URL || 'http://127.0.0.1:8081');
      const button = label => page.getByRole('button', {name: label, exact:true});
      const activate = async label => options.hasTouch ? button(label).tap() : button(label).click();
      await activate('▶ Comenzar aventura');
      await activate('Seguir mi camino →');
      await page.locator('canvas').waitFor();
      assert.equal(await button('Caminar a la derecha').count(), options.hasTouch ? 1 : 0, name);
      assert.equal(await button('Saltar').count(), options.hasTouch ? 1 : 0, name);
      for (const label of ['▤ Cuaderno', '◇ Inventario', 'Pausa']) {
        const box = await button(label).boundingBox();
        assert(box.x >= 0 && box.x + box.width <= options.viewport.width, `${name}: ${label} fits the screen`);
      }
      await page.screenshot({path:`${process.env.ARTIFACTS_DIR || "/tmp"}/gameplay-${name.replaceAll(' ','-')}.png`});
      await activate('Pausa');
      const instructions = options.hasTouch ? 'Puedes caminar y saltar a la vez' : 'Esc: pausa';
      assert(await page.getByText(instructions, {exact:false}).isVisible(), name);
      if (options.hasTouch) assert.equal(await page.getByText('Espacio', {exact:false}).count(), 0);
      await activate('Continuar aventura');
      await activate('▤ Cuaderno');
      assert(await page.getByText(instructions, {exact:false}).isVisible());
      await activate('Volver');
      if (options.hasTouch) {
        const cdp = await context.newCDPSession(page);
        const rightBox = await button('Caminar a la derecha').boundingBox();
        const jumpBox = await button('Saltar').boundingBox();
        const point = (box,id) => ({x:box.x+box.width/2,y:box.y+box.height/2,id});
        await cdp.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[point(rightBox,1)]});
        await cdp.send('Input.dispatchTouchEvent', {type:'touchStart',touchPoints:[point(rightBox,1),point(jumpBox,2)]});
        await page.waitForTimeout(900);
        await cdp.send('Input.dispatchTouchEvent', {type:'touchEnd',touchPoints:[]});
        await activate('▤ Cuaderno');
        assert(await page.getByText('✓ Caminar', {exact:false}).isVisible());
        assert(await page.getByText('✓ Saltar', {exact:false}).isVisible());
        await activate('Volver');
        // A hardware keyboard takes over without requiring a reload.
        await page.keyboard.press('ArrowRight');
        await button('Caminar a la derecha').waitFor({state:'detached'});
        await activate('Pausa');
        assert(await page.getByText('Puedes caminar y saltar a la vez', {exact:false}).isVisible());
      } else {
        // Space activates the focused HUD control without also jumping.
        await button('▤ Cuaderno').focus();
        await page.keyboard.down('Space');
        await page.waitForTimeout(150);
        await page.keyboard.up('Space');
        assert.equal(await page.getByText('✓ Saltar', {exact:false}).count(), 0);
        await activate('Volver');
        await page.keyboard.down('d');
        await page.waitForTimeout(900);
        await page.keyboard.up('d');
        await page.keyboard.press('Space');
        await page.waitForTimeout(100);
        await page.keyboard.press('j');
        assert(await page.getByText('✓ Caminar', {exact:false}).isVisible());
        assert(await page.getByText('✓ Saltar', {exact:false}).isVisible());
      }
      await page.screenshot({path:`${process.env.ARTIFACTS_DIR || "/tmp"}/controls-${name.replaceAll(' ','-')}.png`});
      assert.deepEqual(errors, [], name);
      console.log(name, 'controls ok');
      await context.close();
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
