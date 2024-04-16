import { Octokit } from "@octokit/rest";
import { config } from "dotenv";
import words from "words";
config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export async function findSwearCommits() {
  const latestSwearCommits: string[] = [];

  for (const swearGroup of words) {
    for (const swear of swearGroup[0]) {
      const res = await octokit.rest.search.commits({
        q: swear,
        sort: "committer-date",
        order: "desc",
        per_page: 5,
      });
      for (const commit of res.data.items) {
        if (commit.commit.message.match(swearGroup[1])) {
          latestSwearCommits.push(commit.commit.message);
        }
      }
    }
  }

  return latestSwearCommits;
}
