import { getInput, setFailed } from "@actions/core";
import { getOctokit } from "@actions/github";
import { Action } from "src/action";

(async () => {
  const token: string = getInput("token", { required: true });
  const [owner, repo]: string[] = getInput("repository", {
    required: true,
  }).split("/");
  const workflow: string | number | undefined = getInput("workflow", {
    required: true,
  });
  const retain = parseInt(getInput("retain", { required: true }), 10);
  const branch = getInput("branch", { required: false });

  const octokit = getOctokit(token);

  try {
    await new Action().run(octokit, repo, owner, retain, workflow, branch);
  } catch (e) {
    setFailed((e as Error).message);
  }
})();
