import apiClient from "./apiClient";

export async function GetCurrentJobs()
{
    let data = null;
    await apiClient.get(`/jobs/current/${localStorage["userID"]}`)
    .then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}

export async function GetJobHistory()
{
    let data = null;

    await apiClient.get(`/jobs/history`)
    .then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}

export async function CreateJob(description, deadline, userID)
{
    let data = null;

    await apiClient.post("/jobs/new",
        {
            description: description,
            dueDate: deadline,
            assignedId: userID,
        }
    ).then((res) => {
        data = res;
    }).catch((err) => {
        console.log(err)
        data = err;
    });
    return data;
}

export async function EditCurrentJob()
{

}

export async function CompleteJob(jobID, remarks)
{
    let data = null;

    await apiClient.post("/jobs/complete/" + jobID,
        {
            remarks: remarks,
        }
    ).then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}

export async function AssignJob(jobID, userID)
{
    let data = null;

    await apiClient.post("/jobs/assign_job",
        {
            jid: jobID,
            uid: userID
        }
    ).then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}
