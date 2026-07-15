"use client";

import { useState, useEffect } from "react";
import { LogIn } from "@/scripts/chat";
import { useMediaQuery } from "react-responsive";
import { BusinessChatComponent } from "@/components/Chat/BusinessChatComponent";
import PageLoad from "@/components/PageLoad";

export default function Page() {
    const [id, setID] = useState("");
    const [token, setToken] = useState(null);
    const [channel, setChannel] = useState(null);
    const [loading, setLoading] = useState(true);

    const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

    useEffect(() => {
        async function fetchData() {
            // Make sure localStorage is accessible:
            const storedID = typeof window !== "undefined" ? localStorage["userID"] : "";
            setID(storedID)

            const businessID = typeof window !== "undefined" ? localStorage["businessID"] : "";

            if (!storedID || !businessID) {
                throw new Error("User ID or Business ID not found in localStorage.");
            }
            console.log("Attempt login using that ID")
            console.log("storedID:"+storedID)
            console.log("businessID:"+businessID)
            // Attempt login — identity comes from the auth cookie server-side
            console.log("LogIn")
            let res = await LogIn();
            if (res.stat === 200) {
                setChannel(res.data.channels);
                setToken(res.data.token);
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    if (loading) return <PageLoad message="Loading Chat"/>;
    // console.log(data);
    // if (!data) {
    //     return <h1>Error: Could not load user or token</h1>;
    // }}
    const data = {
        channels: channel,
        token: token,
        user: 'worker-' + localStorage["userID"],
    };
    console.log(data);
    return (
        <div className="!overflow-y-hidden bg-[#F5F5F5] w-full flex flex-col">
            {/* Chat area */}
            <div className="" style={style.container}>
                <BusinessChatComponent data={data} isMobile={isMobile} />
            </div>
        </div>
    );
}
const style = {
    container: {
        height: "calc(100vh - 85px)",
        backgroundColor: "#F5F5F5"
    }
}
