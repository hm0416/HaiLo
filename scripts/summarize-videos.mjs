import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { YoutubeTranscript } from 'youtube-transcript';

// overall flow - loops through the 3 videos, fetches their transcripts, sends the transcript to the AI, AI summarizes, results cached and shown on the UI 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const cachePath = path.join(rootDir, 'scripts', 'video-summaries.json');

const videos = [
    {
        id: 'v1',
        topic: 'anxiety',
        url: 'https://www.youtube.com/watch?v=FpiWSFcL3-c',
    },
    {
        id: 'v2',
        topic: 'stress',
        url: 'https://www.youtube.com/watch?v=RcGyVTAoXEU&t=459s',
    },
    {
        id: 'v3',
        topic: 'depression',
        url: 'https://www.youtube.com/watch?v=HWcphoKlbxY',
    },
];

async function summarizeTranscript(transcriptText) {
    // Limit transcript length to avoid overwhelming the model
    const maxLength = 4000;

    // Truncate the transcript if it exceeds the maximum length otherwise send as is 
    const truncatedText = transcriptText.length > maxLength
        ? transcriptText.substring(0, maxLength) + '...'
        : transcriptText;

    const response = await fetch('http://localhost:1234/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                {
                    role: 'system',
                    content:
                        'You are a helpful recovery coach. Return ONLY valid JSON format. No markdown, no explanations.',
                },
                {
                    role: 'user',
                    content: `Summarize this transcript. Return JSON with exactly this structure:
{
  "tipsAndTricks": ["tip 1", "tip 2", "tip 3"],
  "actionPlan": ["action 1", "action 2", "action 3"]
}

Transcript: ${truncatedText}`,
                },
            ],
            temperature: 0.3, // a little creative 
            max_tokens: 1000,
            stream: false,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`LM Studio request failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    // 
    const payload = await response.json();
    const raw = payload.choices?.[0]?.message?.content ?? '{}';

    // Try to extract JSON if it's wrapped in markdown or has extra text. trim whitespaces
    let jsonString = raw.trim();

    // Remove markdown code blocks if present, captures json objects within the block. cleaner output
    const markdownMatch = jsonString.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (markdownMatch) {
        jsonString = markdownMatch[1];
    } else {
        // Try to find JSON object in the text
        const jsonMatch = jsonString.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
            jsonString = jsonMatch[1]; // just grab the first JSON object found
        }
    }

    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Failed to parse JSON from LM Studio:', error.message);
        console.error('Raw content:', raw);
        throw new Error(`Failed to parse LM response as JSON: ${error.message}`);
    }
}

async function main() {
    const summaries = {};

    for (const video of videos) {
        try {
            // Extract video ID from URL
            const videoId = video.url.match(/[?&]v=([^&]+)/)?.[1] || video.url.split('/').pop();
            console.log(`Fetching transcript for ${video.id} (${videoId})...`);

            const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
                lang: 'en',
            });
            const transcriptText = transcript.map((entry) => entry.text).join(' '); // one long string
            const result = await summarizeTranscript(transcriptText); // AI does the work here
            summaries[video.id] = { // forms the summary block for each video 
                id: video.id,
                topic: video.topic,
                url: video.url,
                ...result,
            };
            console.log(`Processed ${video.id}`);
        } catch (error) {
            console.warn(`Failed for ${video.id}:`, error.message);
            console.warn(video.url)
            summaries[video.id] = {
                id: video.id,
                topic: video.topic,
                url: video.url,
                summary: 'Summary unavailable yet.',
                tipsAndTricks: ['Try the video directly.'],
                actionPlan: ['Watch the video and reflect.'],
            };
        }
    }

    fs.writeFileSync(cachePath, JSON.stringify(summaries, null, 2)); // save all summaries to cache 
    console.log('Saved summaries to', cachePath);
}

main().catch((error) => { // executed when script is ran in the CLI 
    console.error(error);
    process.exit(1);
});
