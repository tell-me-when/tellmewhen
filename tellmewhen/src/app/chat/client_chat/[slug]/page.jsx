"use client";

import { useState, useEffect } from "react";
import { GuestLogin } from "@/scripts/chat";
import { ClientChatComponent } from "@/components/Chat/ClientChatComponent";
import { useParams } from "next/navigation";
import PageLoad from "@/components/PageLoad";

export default function Page() {

    const [guest_token, setToken] = useState(null);
    const [guest_channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const params = useParams()
    const jobId = params.slug;
    
    useEffect(() => {

        async function initChat() {
            try {
                setErrorMessage("");
                setLoading(true);
                
                // Store jobId in localStorage for later use
                if (jobId && typeof window !== "undefined") {
                    localStorage.setItem("jobID", jobId);
                }

                console.log("GuestLogin with jobId:", jobId);
                let res = await GuestLogin(jobId);

            
                if (res && res.token && res.channel) {
                    setChannel(res.channel);
                    setToken(res.token);
                } else {
                    throw new Error("Invalid response from server");
                }
            } catch (err) {
                console.error("Failed to create guest user:", err);
                setErrorMessage("Could not load chat. Please check if the job ID is valid.");
            } finally {
                setLoading(false);
            }
        }

        if (jobId) {
            initChat();
        } else {
            setErrorMessage("No job ID provided");
            setLoading(false);
        }
    }, [jobId]);

    const data = {
        channels: guest_channel ? [guest_channel] : null, 
        token: guest_token,
        user: 'guest-' + jobId, // Use jobId 
    };

    console.log("Chat data:", data);

    if (loading) {
        return <PageLoad message="Loading Chat"/>;
    }

    if (errorMessage) {
        return <PageLoad message={errorMessage} />;
    }

    if (!data.token || !data.channels) {
        return <PageLoad message="Unable to load chat data" />;
    }

    return (
        <div className="!overflow-y-hidden bg-[#F5F5F5] w-full flex flex-col">
            <div style={style.container}>
                <ClientChatComponent data={data} />
            </div>
        </div>
    );
}

const style = {
    container: {
        height: "calc(100vh - 85px)",
    }
}