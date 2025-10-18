
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);

/**
 * Executes a shell command and returns the output.
 * @param {string} command The command to execute.
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
async function executeCommand(command) {
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    return { stdout, stderr };
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
    throw error;
  }
}

/**
 * Converts a VTT file content to a more readable transcript format.
 * @param {string} vttContent The content of the VTT file.
 * @returns {string} The formatted transcript.
 */
function formatTranscript(vttContent) {
    let lines = vttContent.split('\n');
    let transcript = '';
    let currentTime = '';

    for (const line of lines) {
        if (line.includes('-->')) {
            currentTime = line.split(' --> ')[0];
        } else if (line.trim() && !line.startsWith('WEBVTT') && !line.startsWith('Kind:') && !line.startsWith('Language:')) {
            if (currentTime) {
                transcript += `[${currentTime}] ${line.trim()}\n`;
                currentTime = ''; // Reset time to avoid duplicating it for multi-line captions
            } else if (transcript.endsWith('\n')) {
                 transcript += `${line.trim()}\n`;
            }
        }
    }
    return transcript;
}


/**
 * Converts a YouTube video to a self-contained HTML page with transcript and screenshots.
 * @param {string} videoUrl The URL of the YouTube video.
 * @param {string} outputDir The directory to save the final HTML file.
 * @returns {Promise<string>} The path to the generated HTML file.
 */
async function convertToWebpage(videoUrl, outputDir) {
  const videoId = new URL(videoUrl).searchParams.get('v');
  if (!videoId) {
    throw new Error('Invalid YouTube URL. Could not extract video ID.');
  }

  const tempDir = path.join(outputDir, `temp_${videoId}_${Date.now()}`);
  await fs.mkdir(tempDir, { recursive: true });

  console.log(`[youtube2webpage] Created temporary directory: ${tempDir}`);

  try {
    // 1. Download video, info, and transcript using yt-dlp
    console.log(`[youtube2webpage] Downloading video info and transcript for ${videoId}...`);
    const videoPath = path.join(tempDir, `${videoId}.mp4`);
    const infoPath = path.join(tempDir, `${videoId}.info.json`);
    const transcriptPath = path.join(tempDir, `${videoId}.en.vtt`);

    await executeCommand(
      `yt-dlp -o "${videoPath}" -f "best[ext=mp4]" --write-info-json --write-auto-sub --sub-lang en --skip-download ${videoUrl}`
    );
     await executeCommand(
      `yt-dlp -o "${videoPath}" -f "best[ext=mp4]" ${videoUrl}`
    );


    let transcriptContent = 'No transcript available.';
    try {
        const vttContent = await fs.readFile(transcriptPath, 'utf8');
        transcriptContent = formatTranscript(vttContent);
    } catch (error) {
        console.log(`[youtube2webpage] Could not find or read transcript file for ${videoId}. Continuing without transcript.`);
    }


    const infoJson = await fs.readFile(infoPath, 'utf8');
    const videoInfo = JSON.parse(infoJson);
    const title = videoInfo.title || 'Untitled';

    // 2. Take screenshots using ffmpeg
    console.log(`[youtube2webpage] Taking screenshots for ${videoId}...`);
    const screenshotsDir = path.join(tempDir, 'screenshots');
    await fs.mkdir(screenshotsDir, { recursive: true });
    await executeCommand(
      `ffmpeg -i "${videoPath}" -vf "fps=1/30" "${path.join(screenshotsDir, 'screenshot-%03d.png')}"`
    );

    const screenshotFiles = (await fs.readdir(screenshotsDir)).filter(f => f.endsWith('.png'));

    // 3. Generate HTML content
    console.log(`[youtube2webpage] Generating HTML page for ${videoId}...`);
    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: sans-serif; line-height: 1.6; margin: 20px; background-color: #f4f4f4; color: #333; }
          .container { max-width: 800px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          h1 { color: #d9534f; }
          h2 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
          video { width: 100%; border-radius: 8px; }
          .screenshots { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-top: 20px; }
          .screenshots img { width: 100%; border-radius: 4px; box-shadow: 0 0 5px rgba(0,0,0,0.1); }
          pre { background: #eee; padding: 10px; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>${title}</h1>
          <video controls src="${videoPath}"></video>
          <h2>Screenshots</h2>
          <div class="screenshots">
            ${screenshotFiles.map(file => `<img src="${path.join(screenshotsDir, file)}" alt="Screenshot">`).join('')}
          </div>
          <h2>Transcript</h2>
          <pre>${transcriptContent}</pre>
          <h2>AI Analysis</h2>
          <div id="ai-analysis">
            <!-- AI analysis will be injected here -->
          </div>
        </div>
      </body>
      </html>
    `;

    const finalHtmlPath = path.join(outputDir, `${videoId}.html`);
    await fs.writeFile(finalHtmlPath, htmlContent);

    console.log(`[youtube2webpage] Successfully created HTML page: ${finalHtmlPath}`);
    return { htmlPath: finalHtmlPath, transcript: transcriptContent };

  } finally {
    // 4. Clean up temporary directory
    // console.log(`[youtube2webpage] Cleaning up temporary directory: ${tempDir}`);
    // await fs.rm(tempDir, { recursive: true, force: true });
    console.log(`[youtube2webpage] Skipping cleanup of temporary directory for now: ${tempDir}`);
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

module.exports = { convertToWebpage };
