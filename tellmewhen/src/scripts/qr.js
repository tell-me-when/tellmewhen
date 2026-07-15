import apiClient from "./apiClient";

// DONE
export async function GetCode(jobID) {
    /*
    Gets a QR code for the user to add a job
    Parameters:
        jobID: string
    Returns:
        string: Base64 encoded image

    */

    let data = null;
    await apiClient.get("/jobs/display_code/" + jobID)
    .then((res) => {
        data = res
    }).catch(err => console.error(err));
    return data;
}
