import { findSwearCommits } from "github";
import { twitterClient } from "twitter";
import words from "words";

const maxTweetLength = 280;

// Shortens a commit message to fit within the max tweet length
function shortenTweet(commit: string): [string, string] {
  let index = 0;
  let matchedWord = null;

  for (const swearGroup of words) {
    const match = commit.match(swearGroup[1]);
    if (match) {
      matchedWord = match[0]!;
      index = commit.indexOf(match[0]);
      break;
    }
  }

  let start = index - 50;
  if (start < 0) start = 0;
  let end = index + 50;
  if (end > commit.length) end = commit.length;

  let shortened = commit.slice(start, end);
  if (start > 0) shortened = `...${shortened}`;
  if (end < commit.length) shortened = `${shortened}...`;
  return [shortened, matchedWord!];
}

function filterDuplicates(commits: [string, string][]): [string, string][] {
  const uniqueCommits = new Set<[string, string]>();
  for (const commit of commits) {
    uniqueCommits.add(commit);
  }
  return Array.from(uniqueCommits);
}

async function loop() {
  try {
    const commits = filterDuplicates(
      (await findSwearCommits()).map(shortenTweet)
    );

    const commit = commits[Math.floor(Math.random() * commits.length)];

    console.log(commit);
    const tweet = await twitterClient.v2.tweet(commit[0]);
    await twitterClient.v2.reply(`Match: ${commit[1]}`, tweet.data.id);
  } catch (e) {
    console.error(e);
  }
}

loop();

// Run every hour, twitter api lets you have 1500 messages per month
setInterval(loop, 1000 * 60 * 60);
