"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useParams } from "next/navigation";
import { GetJobDetails } from "@/scripts/customer";
import React, { use } from "react";
import { RegisterServiceWorker, SaveSubscription } from "@/scripts/webpush";
import { Button } from "@mui/joy";
import Switch, { switchClasses } from '@mui/joy/Switch';

/* 

                            DYNAMIC ROUTING
This will allow for data to be added to the end of the URL in the form of

            localhost:PORT:/customer_view/......

This then can be accessed using params.slug
(only name that works as far as i know :( )

*/

// function Page({params}) {

function Page() {
    const [text, setText] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [errorDetails, setErrorDetails] = useState("");
    // const parameters = React.use(params)
    const [decryptedJobID, setDecryptedJobID] = useState("");
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const params = useParams();
    let jobID = params.slug;

    useEffect(() => {
        checkSubscriptionStatus();
    }, []);

    async function saveSubscription(subscription) {
        let endpoint = localStorage["endpoint"];
        let res = await SaveSubscription(subscription, params.slug, localStorage["businessID"]);
    }

    const checkSubscriptionStatus = async () => {
        if ("serviceWorker" in navigator) {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            setNotificationsEnabled(subscription);
        }
    };

    const testNotification = async () => {
        if (!("Notification" in window) || !("serviceWorker" in navigator)) {
            alert("Notifications are not supported in this browser.");
            return;
        }

        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            alert("Notification permission denied.");
            return;
        }

        const registration = await navigator.serviceWorker.ready;
        registration.showNotification("Test Notification", {
            body: "This is a dummy notification for testing purposes.",
            data: { url: `/customer_view/${params.slug}` },
        });
    };

    const enableNotifications = async () => {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            setNotificationsEnabled(false);
            alert("Notification permission denied.");
            return false;
        }


        //job/display_code/:jId
        try {
            let subscription = await RegisterServiceWorker();
            await saveSubscription(subscription);
            setNotificationsEnabled(true);
            return true;
        } catch (error) {
            console.log("Error enabling notifications:", error);
        }
        return false;
    };

    const disableNotifications = async () => {
        if ("serviceWorker" in navigator) {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();
            if (subscription) {
                await subscription.unsubscribe();
                setNotificationsEnabled(false);
            }
        }
    };

    useEffect(() => {
        //if(params.slug == "undefined") window.location.href = 
        async function fetchJobDetails() {
            try {
                const details = await GetJobDetails(params.slug);
                if (details.status === 200) {
                    console.log(details)
                    setBusinessName(details.data[0].Business_Name || "");
                    setJobDescription(details.data[0].Description || "");
                    setDecryptedJobID(details.data[0].jobId || "");
                    localStorage["jobID"] = details[0].data.jobId;
                    console.log("Job ID: " + localStorage["jobID"]);
                    setErrorDetails("");
                } else {
                    setErrorDetails("Cannot connect to server");
                }
            } catch (error) {
                setErrorDetails("Cannot connect to server");
            }
        }
        document.cookie = "eji=" + params.slug + "; expires=" + new Date(2147483647 * 1000).toUTCString()
        if (params.slug) {
            localStorage["encryptedJobID"] = params.slug
            fetchJobDetails();
        }
    }, [params.slug]); // Use params.slug as the dependency

    return (
        <div className="w-[100vw] h-[100%] overflow-y-scroll absolute top-[0px] bg-[#F5F5F5] ">

        <div className=" flex flex-col pt-20 pb-8 bg-gray-100">
            <div className="flex flex-col items-center justify-start mt-12 px-6">

                {/* Radio buttons to enable/disable notifications */}


                {/* Business details */}
                <div className="w-full max-w-2xl mx-auto bg-white border border-gray-300 rounded-lg shadow-md p-6">
                    {/* Details Section */}
                    <div className="text-center mb-6">
                        <h2 className="font-bold text-[25px] text-gray-900">Details</h2>
                    </div>
                    {errorDetails ? (
                        <div className="text-red-500 text-sm mt-2">{errorDetails}</div>
                    ) : (
                        <>
                            <div className="mb-4">
                                <p className="text-[20px] font-semibold text-gray-700">Business</p>
                                <p className="text-gray-600">{businessName}</p>
                            </div>
                            <div>
                                <p className="text-[20px] font-semibold text-gray-700">Job Description</p>
                                <p className="text-gray-600">{jobDescription}</p>
                            </div>
                        </>
                    )}

                </div>
                <div className="w-full max-w-2xl mt-[15px] mx-auto bg-white border border-gray-300 rounded-lg shadow-md p-6">
                    <div className="text-center mb-6">
                        <h2 className="font-bold text-[25px] text-gray-900">Settings</h2>
                    </div>
                    <div className="grid inline">
                        <div className="flex justify-between ml-[15px] gap-8 mb-8">
                            <p className="font-semibold text-xl text-gray-700">Enable Notifications:</p>
                            <Switch
                                key={notificationsEnabled}
                                checked={notificationsEnabled}
                                onChange={async (event) => {
                                    if (event.target.checked) {
                                        setNotificationsEnabled(true);
                                        await enableNotifications()

                                    } else {
                                        await disableNotifications();
                                        setNotificationsEnabled(false);
                                    }
                                }}
                                sx={(theme) => ({
                                    '--Switch-thumbShadow': '0 3px 7px 0 rgba(0 0 0 / 0.12)',
                                    '--Switch-thumbSize': '27px',
                                    '--Switch-trackWidth': '51px',
                                    '--Switch-trackHeight': '31px',
                                    '--Switch-trackBackground': theme.vars.palette.background.level3,
                                    [`& .${switchClasses.thumb}`]: {
                                        transition: 'width 0.2s, left 0.2s',
                                    },
                                    '&:hover': {
                                        '--Switch-trackBackground': theme.vars.palette.background.level3,
                                    },
                                    '&:active': {
                                        '--Switch-thumbWidth': '32px',
                                    },

                                })}
                            />
                        </div>
                        <Button onClick={()=>window.location.href=`/chat/client_chat/${decryptedJobID}`} className="px-6 py-3 h-[40px] bg-green-600 w-full justify-self-center text-white font-semibold rounded-lg shadow-md hover:bg-green-700">
                            Chat
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

export default Page;
