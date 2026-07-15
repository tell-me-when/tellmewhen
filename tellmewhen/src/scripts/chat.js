import apiClient from "./apiClient";

export async function GuestLogin(jobId) {
    let data = null;
    await apiClient.get("/chat/guest/login/" + jobId).then(res => {
        console.log(res.status);
        if (res.status === 200) {
            console.log("Guest user created successfully");
            console.log(res.data)
            data = res.data; // return the token and channel
        }
    });
    return data;
}

export async function LogIn() {
    // userId/businessId are derived server-side from the auth cookie now,
    // not taken from the URL.
    let data;
    let stat;

    await apiClient.get("/chat/worker/login")
        .then(res => {
            console.log(res.status);
            if (res.status === 200) {
                console.log("Worker logged in successfully");
                data = res.data; // rturn the token and channels
                stat = res.status;
            }
        });

    return {data:data, stat:stat};
}

export async function DeleteChannel(jobId) {
    await apiClient.post("/chat/channels/delete_channel", {
        jobId: jobId,
    }).then(res => {
        console.log(res.status);
        if (res.status === 200) {
            console.log("Channel deleted successfully");
            return res.data; // return the deletion result
        }
    });
}
