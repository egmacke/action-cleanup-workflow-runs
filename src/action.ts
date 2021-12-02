import { GitHub } from "@actions/github/lib/utils";
import moment from "moment";

class Action {
  public async run(
    octokit: InstanceType<typeof GitHub>,
    repo: string,
    owner: string,
    retain: number,
    workflow: string | number
  ) {
    // Get all workflow runs for repository
    const workflowRuns = await octokit.paginate(
      octokit.rest.actions.listWorkflowRunsForRepo,
      {
        repo,
        owner,
      },
      (response) =>
        response.data.map(
          (data) =>
            ({
              id: data.id,
              name: data.name,
              workflowId: data.workflow_id,
              createdAt: data.created_at,
            } as WorkflowRun)
        )
    );

    // Filter workflowRuns
    let runsToDelete: WorkflowRun[];
    if (typeof workflow === "string") {
      runsToDelete = workflowRuns.filter((run) => run.name === workflow);
    } else if (typeof workflow === "number") {
      runsToDelete = workflowRuns.filter((run) => run.workflowId === workflow);
    } else {
      throw new Error("Workflow could not be determined - not doing cleanup");
    }

    // Sort most recent first
    runsToDelete.sort(
      (runA, runB) =>
        moment(runA.createdAt).milliseconds() -
        moment(runB.createdAt).milliseconds()
    );

    // Preserve `retain` number of runs
    runsToDelete.splice(0, retain);

    const deletePromises = runsToDelete.map((run) =>
      octokit.rest.actions.deleteWorkflowRun({
        owner,
        repo,
        run_id: run.id,
      })
    );

    await Promise.all(deletePromises);
  }
}

interface WorkflowRun {
  id: number;
  name: string;
  workflowId: number;
  createdAt: string;
}

export { Action };
