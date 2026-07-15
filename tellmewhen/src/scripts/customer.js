import apiClient from "./apiClient";


export async function GetJobDetails(jobID)
{
    let data = null;
    await apiClient.get("/customer/my_job/" + jobID)
    .then(res =>
        {
            console.log(res)
            data = res
    })
    return data;

}

export async function GetNotifications() {}
