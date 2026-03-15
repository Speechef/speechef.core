/**
 * record-pitch.js
 * Records pitch-video.html as an MP4 with TTS voiceover using:
 *  - macOS `say` command for audio generation
 *  - Playwright (headless Chrome) for visual recording
 *  - ffmpeg for audio conversion, padding, and mux
 *
 * Usage:  node docs/record-pitch.js
 * Output: docs/speechef-pitch.mp4
 */

const { chromium } = require('/opt/homebrew/lib/node_modules/playwright');
const path = require('path');
const fs = require('fs');
const { execSync, spawnSync } = require('child_process');

// ─── Config ───────────────────────────────────────────────────────────────────
const VOICE   = 'Samantha';   // macOS TTS voice
const RATE    = 165;          // words per minute (default ~175, slightly slower for clarity)
const FFMPEG  = '/tmp/ffmpeg';
const HTML    = path.resolve(__dirname, 'pitch-video.html');
const OUT_MP4 = path.resolve(__dirname, 'speechef-pitch.mp4');
const TMP     = path.resolve(__dirname, '__pitch_tmp__');

// ─── Scripts (must stay in sync with SCRIPTS array in pitch-video.html) ───────
const SCRIPTS = [
  // Slide 1 — Hero
  `Speechef. The all-in-one communication skills platform. Because how you communicate determines how far you go.`,

  // Slide 2 — Problem
  `Two billion people are actively learning English right now. Eighty-five percent of all jobs require strong verbal communication. And three hundred million people take language proficiency tests every single year. Yet there is still no single platform that helps them practice, improve, and prove their skills.`,

  // Slide 3 — The Gap
  `Today's solutions are completely fragmented. Duolingo teaches vocabulary, but has no speech analysis, no mentors, and no jobs. YouTube and Coursera offer passive video — you watch, but you never actually practice. Toastmasters is excellent, but requires physical attendance. And private coaches cost up to two hundred dollars an hour — completely out of reach for most people. Nobody has solved this. Until now.`,

  // Slide 4 — Solution
  `Speechef brings everything together in one place. Learn from structured content. Practice with gamified exercises and streaks. Get instant AI feedback on your speech and writing. Simulate real job interviews. Book vetted communication coaches. And find jobs that are matched directly to your skill level. One platform. Every skill.`,

  // Slide 5 — The Score
  `Here is what makes Speechef truly different. Every activity — every game, every AI analysis, every mock interview — feeds into a single verified Speechef Score. Think of it like an IELTS band score, but dynamic, continuously updated, and shareable directly with employers and mentors. Your score becomes your credential. And your credential opens doors.`,

  // Slide 6 — Features
  `Eleven features, all live and production-ready. The Learn Hub and Practice Games build skills daily. AI Speech Analysis, Writing Coach, and Resume Analyzer deliver instant feedback. Mock Interviews and Roleplay Simulations prepare users for real high-stakes conversations. Expert Reviews provide human feedback within forty-eight hours. The Mentorship Marketplace, Jobs Board, and Community Forum complete the full ecosystem. Every feature built. Every feature working.`,

  // Slide 7 — Business Model
  `Speechef runs four revenue streams simultaneously. Monthly subscriptions from nineteen to forty-nine dollars cover core SaaS revenue with an eighty percent gross margin. A twenty to twenty-five percent commission on every mentor session booked creates marketplace revenue that scales without linear cost. One-time expert review fees capture high-intent premium purchases. And a B2B jobs board lets employers pay to find score-verified candidates. Four streams. One platform.`,

  // Slide 8 — Market
  `The market opportunity is enormous. Seventy billion dollars in global EdTech. Two billion people learning English, concentrated in India, Southeast Asia, and the Middle East — the fastest growing economies in the world. At just ten thousand paying Pro subscribers at nineteen dollars a month, Speechef generates two point three million dollars in annual recurring revenue. This is not a niche product. This is infrastructure for the next generation of global communicators.`,

  // Slide 9 — CTA
  `Speechef is built, tested, and ready to launch. The full-stack product is complete. Eleven features are live. The architecture is production-ready with CI and CD in place. We are looking for strategic partners, early enterprise clients, and investors who believe that communication is the single most valuable skill in the modern economy. Let's build the future of communication together. Let's talk.`,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function run(cmd, opts = {}) {
  return execSync(cmd, { stdio: 'pipe', ...opts }).toString().trim();
}

/** Returns duration in seconds (float) of a media file via ffprobe. */
function getDuration(file) {
  const out = run(
    `${FFMPEG} -i "${file}" 2>&1 | grep Duration | awk '{print $2}' | tr -d ,`
  );
  // Format: HH:MM:SS.ss
  const [h, m, s] = out.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  fs.mkdirSync(TMP, { recursive: true });

  // ── Step 1: Generate TTS audio for every slide ──────────────────────────────
  console.log('\n🎙  Generating voiceover audio for each slide…');
  const wavFiles = [];
  const audioDurations = [];

  for (let i = 0; i < SCRIPTS.length; i++) {
    const aiff = path.join(TMP, `slide_${i}.aiff`);
    const wav  = path.join(TMP, `slide_${i}.wav`);

    // Generate AIFF via macOS say
    spawnSync('say', ['-v', VOICE, '-r', String(RATE), '-o', aiff, '--', SCRIPTS[i]], {
      stdio: 'inherit',
    });

    // Convert to WAV (pcm_s16le, 44100 Hz, mono)
    run(`${FFMPEG} -y -i "${aiff}" -ar 44100 -ac 1 -c:a pcm_s16le "${wav}"`);
    fs.unlinkSync(aiff);

    const dur = getDuration(wav);
    audioDurations.push(dur);
    wavFiles.push(wav);

    console.log(`   Slide ${i + 1}: ${dur.toFixed(2)}s  → "${SCRIPTS[i].slice(0, 55)}…"`);
  }

  // ── Step 2: Compute slide hold durations ─────────────────────────────────────
  //
  // Timeline explanation:
  //   The video recording starts at t=0.  Playwright waits 600ms before calling
  //   goTo(0), so the first slide's hold begins at t≈0.6s (INITIAL_SETTLE).
  //   We compensate by prepending 600ms of silence to the audio track so that
  //   audio t=0 aligns with video t=0, and slide-N audio clips start exactly
  //   when slide-N's hold starts in the video.
  //
  //   Each slide's hold = LEAD_IN + speechDur + TRAIL_BUFFER
  //     LEAD_IN      — silence before speech starts (slide visible, no voice yet)
  //     TRAIL_BUFFER — silence after speech, before the visual transition fires
  //
  //   Each padded audio clip = LEAD_IN + speech + TRAIL_BUFFER + 0.9 (transition)
  //   = SLIDE_DURATION_S + 0.9  → clips stay perfectly in sync across all slides.

  const CSS_FADE_S   = 0.9;  // transition: opacity 0.9s in the HTML
  // Slide 0: the 600ms Playwright settle + 0.9s CSS fade = 1.5s before slide is visible.
  //   The 600ms settle is added as an initial silence prefix to the whole audio track
  //   (see "initial silence" below), so LEAD_IN_0 only needs to cover the 0.9s CSS fade.
  // Slides 1–8: goTo is called 0.9s before the hold starts (transition time), but
  //   by the time the hold begins the slide IS fully visible, so 0.5s breathing room.
  const LEAD_IN_0    = CSS_FADE_S;  // 0.9s
  const LEAD_IN_N    = 0.5;         // 0.5s for slides 1–8
  const TRAIL_BUFFER = 2.0;         // 2s silence after speech fires before visual transition

  const SLIDE_DURATIONS_MS = audioDurations.map((d, i) => {
    const leadIn = i === 0 ? LEAD_IN_0 : LEAD_IN_N;
    return Math.round((leadIn + d + TRAIL_BUFFER) * 1000);
  });
  const TOTAL_MS =
    SLIDE_DURATIONS_MS.reduce((a, b) => a + b, 0) +
    SCRIPTS.length * 900 +
    2000;

  console.log(`\n📐  Slide durations: [${SLIDE_DURATIONS_MS.map(d => (d / 1000).toFixed(1)).join(', ')}]s`);
  console.log(`   Total video length: ~${Math.round(TOTAL_MS / 1000)}s\n`);

  // ── Step 3: Record the visual video with matching timings ───────────────────
  console.log('🎬  Recording slides with Playwright…');

  const videoTmpDir = path.join(TMP, 'video');
  fs.mkdirSync(videoTmpDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: videoTmpDir,
      size: { width: 1920, height: 1080 },
    },
  });
  const page = await context.newPage();
  await page.goto('file://' + HTML, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // Patch page: disable voice, hide controls, take manual control of timing
  await page.evaluate(() => {
    window.voiceEnabled = false;
    window.speechSynthesis && window.speechSynthesis.cancel();
    ['#controls', '#dots', '#progress', '#voice-indicator'].forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.style.display = 'none';
    });
    // Stop the auto-timer so we drive it
    clearTimeout(window.autoTimer);
    window.isAuto = false;
    // Go to slide 0 cleanly
    if (typeof goTo === 'function') goTo(0);
  });

  // Drive each slide for exactly its computed duration
  for (let i = 0; i < SCRIPTS.length; i++) {
    console.log(`   Slide ${i + 1} / ${SCRIPTS.length} — holding for ${(SLIDE_DURATIONS_MS[i] / 1000).toFixed(1)}s`);
    await page.waitForTimeout(SLIDE_DURATIONS_MS[i]);

    if (i < SCRIPTS.length - 1) {
      // Advance to next slide
      await page.evaluate(idx => { if (typeof goTo === 'function') goTo(idx); }, i + 1);
      await page.waitForTimeout(900); // let CSS fade play
    }
  }

  // Hold last frame for 2s
  await page.waitForTimeout(2000);

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  const rawWebm = path.join(TMP, 'recording.webm');
  fs.copyFileSync(videoPath, rawWebm);
  console.log('   Visual recording done.\n');

  // ── Step 4: Build the audio track — pad each clip, then concatenate ─────────
  console.log('🔊  Building audio track…');

  // 600ms initial silence aligns the audio with Playwright's page-settle delay.
  // Without it the audio would be 0.6s ahead of the video for every slide.
  const initSilence = path.join(TMP, 'init_silence.wav');
  run(`${FFMPEG} -y -f lavfi -i "anullsrc=r=44100:cl=mono" -t 0.6 "${initSilence}"`);

  const paddedFiles = [initSilence];

  for (let i = 0; i < SCRIPTS.length; i++) {
    const padded    = path.join(TMP, `padded_${i}.wav`);
    const leadIn    = i === 0 ? LEAD_IN_0 : LEAD_IN_N;
    // post = TRAIL_BUFFER + CSS_FADE_S (transition silence) for all but the last slide
    const postDur   = TRAIL_BUFFER + (i < SCRIPTS.length - 1 ? CSS_FADE_S : 0);

    const preFile   = path.join(TMP, `pre_${i}.wav`);
    const postFile  = path.join(TMP, `post_${i}.wav`);

    run(`${FFMPEG} -y -f lavfi -i "anullsrc=r=44100:cl=mono" -t ${leadIn}  "${preFile}"`);
    run(`${FFMPEG} -y -f lavfi -i "anullsrc=r=44100:cl=mono" -t ${postDur} "${postFile}"`);

    const concatList = path.join(TMP, `concat_${i}.txt`);
    fs.writeFileSync(concatList,
      `file '${preFile}'\nfile '${wavFiles[i]}'\nfile '${postFile}'\n`
    );
    run(`${FFMPEG} -y -f concat -safe 0 -i "${concatList}" -ar 44100 -ac 1 "${padded}"`);
    paddedFiles.push(padded);
  }

  // Concatenate: init_silence + all padded clips → final audio
  const allConcat = path.join(TMP, 'full_concat.txt');
  fs.writeFileSync(allConcat, paddedFiles.map(f => `file '${f}'`).join('\n'));
  const fullAudio = path.join(TMP, 'full_audio.wav');
  run(`${FFMPEG} -y -f concat -safe 0 -i "${allConcat}" "${fullAudio}"`);
  console.log('   Audio track built.\n');

  // ── Step 5: Mux video + audio → final MP4 ───────────────────────────────────
  console.log('🔄  Muxing video + audio → MP4…');
  run(
    `${FFMPEG} -y ` +
    `-i "${rawWebm}" ` +
    `-i "${fullAudio}" ` +
    `-c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p ` +
    `-c:a aac -b:a 128k ` +
    `-movflags +faststart ` +
    `-shortest ` +
    `"${OUT_MP4}"`,
    { stdio: 'inherit' }
  );

  // ── Cleanup ──────────────────────────────────────────────────────────────────
  fs.rmSync(TMP, { recursive: true, force: true });

  const size = Math.round(fs.statSync(OUT_MP4).size / 1024 / 1024 * 10) / 10;
  console.log(`\n✅  Done!  →  docs/speechef-pitch.mp4  (${size} MB)\n`);
})().catch(err => {
  console.error('\n❌  Error:', err.message);
  if (err.stderr) console.error(err.stderr.toString().slice(0, 500));
  process.exit(1);
});
