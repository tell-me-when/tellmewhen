import apiClient from "./apiClient";

// Helper function for key parameter
// function urlB64ToUint8Aqrray(base64String) {
//     const padding = '='.repeat((4 - base64String.length % 4) % 4);
//     const base64 = (base64String + padding)
//         .replace(/-/g, '+')
//         .replace(/_/g, '/');
//     const rawData = window.atob(base64);
//     const outputArray = new Uint8Array(rawData.length);

//     for (let i = 0; i < rawData.length; i++) {
//         outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray;
// }



export async function SaveSubscription(subscription, jobId, businessId)
{

    let data = null
    let sub = JSON.parse(JSON.stringify(subscription));
    console.log("Subscription: ", subscription)
    console.log("jobId: ", jobId)
    console.log("businessId: ", businessId)
    let json = {
        jobId: jobId,
        endpoint: sub.endpoint,
        businessId: businessId,
        keys: sub.keys,
    }

    console.log(json);
    await apiClient.post("/save-new-subscription",
        json
    ).then(res => data = res)
    return data
}

export async function NotifyCustomer(jobId, title, body)
{

    let data = null
    await apiClient.post("/jobs/notify/" + jobId,
        {
            title: title,
            message: body,
        }
    ).then(res => data = res);

    return data;
}

export async function RegisterServiceWorker()
{
    const registration = await navigator.serviceWorker.register('/serviceworker.js', {scope: '/'});
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: 'BBMhViKggz_SberAlf-lNtJ5fkVUyFqVj5X_brgnK3d01tYkjxCsbl23C374X62gPiyLSHIrFjDMBQVBoLTxqLE',
    });
    console.log(subscription);
    return subscription;
}
