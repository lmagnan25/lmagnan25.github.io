// Offline, deterministic video export. Requires Playwright Chromium and ffmpeg.
// Run with the local server on port 8765; no personal browser profile is used.
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawn} = require('node:child_process');
const {once} = require('node:events');
let playwright;
try { playwright = require('playwright'); }
catch { playwright = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright')); }

(async () => {
  const root = path.resolve(__dirname, '..');
  const width = 1920, height = 1200, fps = 30;
  const destination = path.join(root, 'assets/film');
  fs.mkdirSync(destination, {recursive:true});
  fs.mkdirSync(path.join(root,'tmp'), {recursive:true});
  const staging=fs.mkdtempSync(path.join(root,'tmp/film-render-'));
  const browser = await playwright.chromium.launch({headless:true, args:['--use-angle=metal']});
  let encoder;
  try {
    const page = await browser.newPage({viewport:{width,height},deviceScaleFactor:1});
    const errors=[];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:8765/scripts/render-film.html');
    await page.waitForFunction(() => document.documentElement.dataset.ready === 'true');
    const {duration}=await page.evaluate(()=>window.filmConfig);
    const frames=Math.ceil(duration*fps);
    const capture=async(time,quality=.97)=>Buffer.from(
      await page.evaluate(([t,q])=>window.captureFilmFrame(t,q),[time,quality]),'base64');
    fs.writeFileSync(path.join(staging,'poster.jpg'),await capture(2,.95));
    encoder = spawn('ffmpeg', ['-hide_banner','-loglevel','error','-y',
      '-f','image2pipe','-framerate',String(fps),'-vcodec','mjpeg','-i','pipe:0',
      '-vf',`fade=t=in:st=0:d=0.55,fade=t=out:st=${duration-.7}:d=0.7`,
      '-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p',
      '-movflags','+faststart','-an',path.join(staging,'reactor.mp4')],
      {stdio:['pipe','inherit','inherit']});
    const completion=once(encoder,'close');
    for (let frame=0;frame<frames;frame++) {
      const image = await capture(frame/fps);
      if (!encoder.stdin.write(image)) await once(encoder.stdin,'drain');
      if (frame % (fps*4) === 0) console.log(`Rendered ${frame/fps}/${duration} seconds`);
      if (errors.length) throw Error(errors.join('\n'));
    }
    encoder.stdin.end();
    const [code]=await completion;
    if(code!==0)throw Error(`ffmpeg exited ${code}`);
    const mobile=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y',
      '-i',path.join(staging,'reactor.mp4'),'-vf','crop=840:1200:540:0,scale=672:960',
      '-c:v','libx264','-preset','slow','-crf','19','-pix_fmt','yuv420p',
      '-movflags','+faststart','-an',path.join(staging,'reactor-mobile.mp4')],{stdio:'inherit'});
    const [mobileCode]=await once(mobile,'close');
    if(mobileCode!==0)throw Error(`Mobile ffmpeg exited ${mobileCode}`);
    for(const name of ['reactor.mp4','reactor-mobile.mp4','poster.jpg'])fs.renameSync(path.join(staging,name),path.join(destination,name));
    console.log('Film complete:',width,height,fps,frames/fps,'seconds',frames,'frames');
  } finally { encoder?.stdin.destroy(); await browser.close(); fs.rmSync(staging,{recursive:true,force:true}); }
})().catch(error=>{console.error(error);process.exitCode=1;});
