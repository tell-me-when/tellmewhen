/* 

    NOTE: JoyUI uses a different styling engine named Emotion, and so the "sx" property in the
    JoyUI components doesn't use tailwind. However, Tailwind styling still works sometimes for
    the components
    
*/
"use client"; //Makes the page client-side rendered rather than server-side rendered
import { useState, useEffect } from "react";
import { Button, Tab, Tabs, TabList, tabClasses, Select, Option, IconButton } from "@mui/joy";
import { Add, CloseRounded } from "@mui/icons-material";
import Pagination from "@/components/Pagination";
import React from "react";
import { AssignJobToEmployee, CompleteJob, CreateJob, GetAllJobHistory, GetCurrentJobs, GetJobHistory } from "@/scripts/dashboard";
import JobCreation from "@/components/Dashboard/JobCreation";
import CurrentJobDetail from "@/components/Dashboard/CurrentJobDetail";
import FinishJobModal from "@/components/Dashboard/FinishJob";
import HistoryJobDetailModal from "@/components/Dashboard/HistoryJobDetail";
import PageLoad from "@/components/PageLoad";
import { GetAccountDetails, GetEmployees, GetPrivilegeLevel } from "@/scripts/account";
import { NotifyCustomer } from "@/scripts/webpush";

function Page() {

    // THIS WILL PREVENT UNAUTHORISED ACCESS WHEN DISABLED WITH THE BACKEND
    // SET TO TRUE TO USE WITHOUT BACKEND
    const DEBUGMODE = false;


    let colours = {
        header: "#0A5397", //Original colour of the header
        primary: "rgba(11,107,203,1)",
        "primary-text-colour": "rgba(255,255,255,1)",
        secondary: "#e3e1e1",
        "secondary-text-colour": "rgba(103,107,111,1)",
        tertiary: "#e9e9e9", //used when highlighting a secondary colour item (switcher)
        "tertiary-text-colour": "rgba(11,13,14,1)",
    };
    // Needed as Tailwind isn't dynamic, and so cant concatenate the above colours in className prop
    let coloursTailwind = {
        primary: `bg-[rgba(11,107,203,1)]`,
        "primary-text-colour": `text-[rgba(255,255,255,1)]`,
        secondary: "bg-[#e3e1e1]",
        tertiary: "bg-[rgba(233,233,233,1)]", //used when highlighting a secondary colour item (switcher)
        "tertiary-semi-transparent": "bg-[rgba(233,233,233,0.9)]",
        //Table Colours
        "rows-colour1": `bg-[#DFDEDD]`,
        "rows-colour2": `bg-[#f0f0f0]`,
        "rows-text-colour": `text-[${colours["rows-text-colour"]}]`,
    };
    colours["primaryTailwind"] = "bg-[" + colours["primary"] + "]";

    //Job Creation Modal State
    const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
    const [formData, setFormData] = useState({ description: "", deadline: "", worker: "" });

    //Job Detail Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // For Current Jobs
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false); // For History Jobs

    //Stores the data for the tables
    const [CurrentTableData, SetCurrentTableData] = useState([]);
    const [HistoryTableData, SetHistoryTableData] = useState([]);
    const [selectedJob, setSelectedJob] = useState({ id: "", description: "", deadline: "", status: "", worker: "" });

    //Finish Job Modal State
    const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
    const [jobToFinish, setJobToFinish] = useState(null);

    //Stores the currently displayed data
    const [DisplayedTableData, SetDisplayedTableData] = useState([]);

    // Stores the necessary table headers and their widths given by percentage of the table    
    const CurrentTableHeaders = ["Job ID", "Description", "Due"];
    const CurrentTableWidths = ["w-[0%]", "w-[85%]", "w-[15%]"];
    const CurrentTableMaxWidths = ["max-w-[0%]", "max-w-[85%]", "max-w-[15%]"];
    const HistoryTableHeaders = ["Job ID", "Description", "Remarks", "Completion Date"];
    const HistoryTableWidths = ["w-0", "w-[43%]", "w-[42%]", "w-[15%]"];
    const HistoryTableMaxWidths = ["max-w-0", "max-w-[43%]", "max-w-[42%]", "max-w-[15%]"];

    // Stores the employee data
    const [employees, SetEmployees] = useState([]);

    //Used to determine which is the currently selected data (Current=0 or History=1)
    const [CurrentIndex, SetIndex] = useState(0);

    // Stores the number of rows per page
    const [RowsCount, SetRowsCount] = useState(null);

    //Stores the current page number
    const [PageNumber, SetPageNumber] = useState(1);

    //Stores the end page number
    const [MaxPageNumber, SetMaxPageNumber] = useState(0);

    // Stores a reference to the action for when the dropdown for the rows changes
    const RowsAction = React.useRef(null);

    // Stores the error to throw when assigning employees
    const [errorMessageAssign, setErrorMessageAssign] = useState('');

    // Stores the current privilege level
    const [PrivilegeLevel, SetPrivilegeLevel] = useState(0);

    //Changes the title of the web page
    if (typeof window !== "undefined") document.title = "Dashboard | Tell Me When";

    const [hidePage, setHidePage] = useState(!DEBUGMODE);
    const [APIError, setAPIError] = useState("");

    useEffect(() => {
        // Sorts the formatting of the table for displayed rows

        let startIndex = (PageNumber - 1) * (RowsCount == null ? 0 : RowsCount);
        let endIndex = PageNumber * (RowsCount == null ? 0 : RowsCount);
        SetDisplayedTableData([]);
        // Set initially incase the data is null
        SetMaxPageNumber(1);
        let tempArray = [];
        if (CurrentIndex == 0) {
            // On the "Current" Page
            if (CurrentTableData == null || CurrentTableData.length == 0 || CurrentTableData == []) {
                return;
            }
            if (RowsCount == null) {
                //When there isn't a limit on the number of rows
                SetDisplayedTableData(CurrentTableData);
                return;
            }
            SetMaxPageNumber(Math.ceil(CurrentTableData.length / RowsCount));
            for (let i = startIndex; i < (endIndex > CurrentTableData.length ? CurrentTableData.length : endIndex); i++) {
                tempArray.push(CurrentTableData[i]);
            }
            SetDisplayedTableData(tempArray);
        } else if (CurrentIndex == 1) {
            // On the "History" Page
            if (HistoryTableData == null || HistoryTableData.length == 0) {
                return;
            }
            if (RowsCount == null) {
                // When there isn't a limit on the number of rows
                SetDisplayedTableData(HistoryTableData);
                return;
            }
            SetMaxPageNumber(Math.ceil(HistoryTableData.length / RowsCount));
            for (let i = startIndex; i < (endIndex > HistoryTableData.length ? HistoryTableData.length : endIndex); i++) {
                tempArray.push(HistoryTableData[i]);
            }
            SetDisplayedTableData(tempArray);
        } else {
            throw new Error("Error parsing table data for table " + CurrentIndex);
        }
        console.log(DisplayedTableData)
    }, [RowsCount, PageNumber, CurrentIndex, HistoryTableData, CurrentTableData]);

    useEffect(() => {
        if (typeof window !== undefined && !DEBUGMODE && !(localStorage["loggedIn"] != true && localStorage["userID"] != null || localStorage["businessID"] != null)) window.location.href = "/auth";

        const CallAPI = async () => {
            // Runs a quick call which can refresh tokens
            await GetAccountDetails()
            
            SetPrivilegeLevel(await GetPrivilegeLevel(localStorage["userID"]))
            const employeesData = await GetEmployees()
            console.log(employeesData);
            if(employeesData.status === 200) SetEmployees(employeesData.data);
            // Makes all the API requests in parallel
            const responses = await Promise.allSettled([
                GetCurrentJobs(),
                GetJobHistory(),
            ])
            let currentJobs, historyJobs;
            try {
                // Checks to see if any of the responses given were unsuccessful
                currentJobs = responses[0].value;
                historyJobs = responses[1].value;
                if (currentJobs == null || historyJobs == null) throw new Error("API Error")
            }
            catch (e){
                console.log(e)
                setAPIError("Cannot connect to the server.")
                return;
            }
            setHidePage(false);
            if (currentJobs.status === 200) {
                let array = []
                let jobs = currentJobs.data
                for(let i = 0; i < jobs.length; i++) {
                    array.push([jobs[i].Job_ID, jobs[i].Description, (jobs[i].Due_Date || "").slice(0, 10)])
                }
                SetCurrentTableData(array)
            }

            if (historyJobs.status === 200) {
                let array = []
                let jobs = historyJobs.data
                for(let i = 0; i < jobs.length; i++) {
                    array.push([jobs[i].Job_ID, jobs[i].Description, jobs[i].Remarks, (jobs[i].Completion_Date|| "").slice(0, 10)])
                }
                SetHistoryTableData(array)
            }
        };
        CallAPI();
    }, []);

    //Function to open the modal
    const handleOpenCreationModal = () => setIsCreationModalOpen(true);

    //Function to close the modal
    const handleCloseModal = () => {
        setIsCreationModalOpen(false);
        setErrorMessageAssign('');
        setFormData({ description: "", deadline: "", worker: "" });
    };

    //Function to handle the confirm button in the modal
    const handleConfirmModal = async () => {

        try {
            // Gets the assigned employees ID
            let employeeID = null;
            if(formData.worker === "") formData.worker = localStorage["username"];
            for(let i = 0; i < employees.length; i++){
                if(employees[i].Username === formData.worker)
                {
                    employeeID = employees[i].User_ID;
                }
            }
            
            // Checks whether the employee is valid
            if(employeeID == null) { setErrorMessageAssign("Invalid employee"); return}

            //Calls API
            const res = await CreateJob(formData.description, formData.deadline, employeeID);
            if (res.status === 201) {
                localStorage["qr"] = res.data.qrCode;
                window.location.href = "/qr_code/"
            }
            else if (res.status === 401) {
                setErrorMessageAssign("Unauthorized request. Please log in to make changes");
                window.location.href = '/auth';
            }
            else if (res.status === 500 || res.status === null || res === null || res === 404) {
                setErrorMessageAssign("An error occurred while connecting to the server.");
            }
            else {
                setErrorMessageAssign("An unknown error occurred.");
            }
        }
        catch (error) {
            console.log(error);
            setErrorMessageAssign("Ann error occurred while connecting to the server.");
        }
    };

    //Function to handle the input change in the modal
    const handleInputChange = (e, fieldName, newValue) => {
        if (newValue !== undefined) {
            setFormData({ ...formData, [fieldName]: newValue });
        }
        else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    //Function to handle the row click in the table
    const handleRowClick = (job) => {
        if (CurrentIndex === 0) {
            // Current Jobs
            setSelectedJob({
                id: job[0],
                description: job[1],
                deadline: job[2],
                status: job[3],
                worker: job[4],
            });
            setIsDetailModalOpen(true);
        } else if (CurrentIndex === 1) {
            // History Jobs
            setSelectedJob({
                id: job[0],
                description: job[1],
                remarks: job[2],
                completionDate: job[3],
                worker: job[4],
            });
            setIsHistoryModalOpen(true);
        }
    };

    //Function to handle the close button in the modal
    const handleUpdateJob = (updatedData) => {
        const updatedJobs = CurrentTableData.map((job) => (
            job[0] === updatedData.id
                ? [updatedData.id, updatedData.description, updatedData.deadline, updatedData.status, updatedData.worker]
                : job
        ));
        SetCurrentTableData(updatedJobs);
        setIsDetailModalOpen(false);
    };

    //Function to handle the finish job button
    const handleOpenFinish = () => {
        // We'll finish whichever job is currently selected
        setJobToFinish(selectedJob);
        console.log(selectedJob);
        setIsFinishModalOpen(true);
    };

    //Function to handle the finish job button
    const handleFinishJob = async (remarks) => {
        if (!jobToFinish) return;
        try{let res2 = await NotifyCustomer(jobToFinish.id, null, null)} catch{}
        let res = await CompleteJob(jobToFinish.id, remarks);
        if(res.status === 201)
        {
            
            window.location.reload();
        }
        else {
            // Handle error
            console.log(res);
        }
    };

    const handleDeleteCurrent = () => {
        const newTableCurrent = CurrentTableData.filter(
            (job) => job[0] !== selectedJob.id);
        SetCurrentTableData(newTableCurrent);
        setIsDetailModalOpen(false);
    };

    const handleDeleteHistory = () => {
        const newTableHistory = HistoryTableData.filter(
            (job) => job[0] !== selectedJob.id);
        SetHistoryTableData(newTableHistory);
        setIsHistoryModalOpen(false);
    };

    if (hidePage) return <PageLoad></PageLoad>
    return (
        <div className="w-[100vw] h-[100vh] overflow-y-scroll fixed bg-[#F5F5F5] ">

        <div className={"page-content max-tablet620:w-[90%] tablet620:w-[80%] m-auto bg-[#F5F5F5]"}>
            {/* Span element is for the controls above the table (Switcher and Button) to keep them inline*/}
            <span className={`z-10 transition ease-in-out hover:scale-[100.75%] sticky top-[15px] ${coloursTailwind["tertiary"]} border-[1px] mb-[10px] border-[#A0A0A0] w-[98%] m-auto rounded-lg shadow-lg mt-[20px] grid grid-cols-2 items-center min-h-[60px] max-tablet620:space-y-[10px] max-tablet620:py-[10px] tablet620:py-[5px] max-tablet620:px-[15px] tablet620:px-[5px]`}>
                <Tabs
                    className="tablet620:justify-self-start max-tablet620:justify-self-center max-tablet620:w-full tablet620:w-[200px] max-tablet620:col-span-full outline outline-[1px] outline-[#B8B8B8] rounded-[10px]"
                    onChange={(event, index) => {
                        SetIndex(index);
                        SetPageNumber(1);
                    }}
                >
                    <TabList
                        disableUnderline
                        sx={{
                            p: 0.5,
                            gap: 0,
                            borderRadius: "10px",
                            bgcolor: colours["secondary"],
                            // Overwrites the styling for the currently selected tab
                            [`& .${tabClasses.root}[aria-selected="true"]`]: {
                                boxShadow: "sm",
                                bgcolor: colours["primary"], // HEADER COLOUR:'rgba(10, 83, 151, 1)',
                                color: colours["primary-text-colour"],
                            },
                            /* Overwrites the styling for all the children(Tabs) */
                            [`& .${tabClasses.root}`]: {
                                px: 5,
                                flex: 1,
                                height: "40px",
                                transition: "0.25s",
                                fontWeight: "650",
                                fontSize: "md",
                                [`&:not(.${tabClasses.selected}):not(:hover)`]: {
                                    opacity: 0.7,
                                },
                            },
                        }}
                    >
                        <Tab disableIndicator>Current</Tab>
                        <Tab disableIndicator>History</Tab>
                    </TabList>
                </Tabs>
                <span className="mt-[0px] max-tablet620:w-full max-tablet620:justify-self-center tablet620:justify-self-end max-tablet620:col-span-full inline flex space-x-[15px] items-center">
                    {/* Dropdown for the number of rows per page */}
                    <Select
                        className="max-tablet620:w-full tablet620:w-[90px] outline outline-[1px]"
                        action={RowsAction}
                        value={RowsCount}
                        placeholder="Rows"
                        sx={{

                            height: "10px",
                            fontSize: "15px",
                        }}
                        onChange={(event, newValue) => {
                            SetRowsCount(newValue);
                            SetPageNumber(1);
                        }}
                        {...(RowsCount != null && {
                            endDecorator: (
                                <IconButton
                                    onMouseDown={(event) => {
                                        event.stopPropagation();
                                    }}
                                    onClick={() => {
                                        SetRowsCount(null);
                                        RowsAction.current?.focusVisible();
                                    }}
                                >
                                    <CloseRounded />
                                </IconButton>
                            ),
                            indicator: null,
                        })}
                    >
                        <Option value={10}>10</Option>
                        <Option value={20}>20</Option>
                        <Option value={50}>50</Option>
                    </Select>
                    <Button
                        endDecorator={<Add />}
                        sx={{
                            fontWeight: "650",
                            bgcolor: colours["primary"],
                            color: colours["primary-text-colour"],
                        }}
                        className="h-[40px] max-tablet620:w-[100%] font-bold"
                        onClick={handleOpenCreationModal}
                    >
                        New Job
                    </Button>
                </span>
            </span>
            <div className="w-full overflow-hidden text-wrap rounded-md shadow-md border-[1px] border-[#AFAFAF]">
                <table key={CurrentIndex /* This is needed as the width of table doesn't update */} className="text-left w-[100%] h-[80%] overflow-visible rounded-md">
                    <thead className={``}>
                        <tr className={`${coloursTailwind["primary"]} text-wrap ${coloursTailwind["primary-text-colour"]} h-[40px]`}>
                            {/* Ternary operator for an if statement to determine which table headers are to be displayed */}
                            {CurrentIndex == 0
                                ? CurrentTableHeaders.map((item, index) => {
                                    if(index == 0) return;
                                    return (
                                        <th key={index} className={`px-[10px] text-wrap ${CurrentTableMaxWidths[index]} ${index != 1 ? `border-l-[2px] border-[rgba(0,0,0,0.2)]` : {}} ${CurrentTableMaxWidths[index]} ${CurrentTableWidths[index]}`}>
                                            {item}
                                        </th>
                                    );
                                })
                                : HistoryTableHeaders.map((item, index) => {
                                    if(index == 0) return;
                                    return (
                                        <th key={index} className={`px-[10px] text-wrap ${index != 1 ? `border-l-[2px] border-[rgba(0,0,0,0.2)]` : {}} ${HistoryTableMaxWidths[index]} ${HistoryTableWidths[index]}`}>
                                            {item}
                                        </th>
                                    );
                                })}
                        </tr>
                    </thead>
                    <tbody className="overflow-visible">
                        {typeof DisplayedTableData != "string" && DisplayedTableData.map((item1, index1) => {
                            return (
                                <tr
                                    key={index1}
                                    className={`cursor-pointer hover:rounded text-wrap hover:outline hover:outline-[2px] hover:outline-offset-[-1.5px] hover:outline-[rgba(70,70,70,0.6)] ${index1 % 2 === 1 ? coloursTailwind["rows-colour1"] : coloursTailwind["rows-colour2"]}`}
                                    onClick={() => handleRowClick(item1)} // Pass the job data to handleRowClick
                                >
                                    {item1.map((item2, index2) => (
                                        index2 != 0 && <td className={`${index2 !== 1 ? "border-l-[2px]" : ""} overflow-hidden max-w-[0px] text-pretty px-[10px] py-[5px] border-[rgba(0,0,0,0.2)]`} key={index2}>
                                            {index2 !== 4 && item2}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {RowsCount != null && (
                <Pagination
                    className="fixed w-[80%] bottom-[20px] justify-self-center flex justify-center"
                    buttonColour={colours["primary"]}
                    fontColourButtons={colours["primary-text-colour"]}
                    SetPageNumber={SetPageNumber}
                    PageNumber={PageNumber}
                    bgColour={colours["tertiary"]}
                    MaxPageNumber={MaxPageNumber}
                    border="true"
                />
            )}

            <div className="bottom-margin mb-[70px]" />

            {/* Job Creation Modal */}
            <JobCreation isOpen={isCreationModalOpen} onClose={handleCloseModal} onConfirm={handleConfirmModal} formData={formData} onInputChange={handleInputChange} errorMessageAssign={errorMessageAssign} employeeData={employees} PrivilegeLevel={PrivilegeLevel}/>
            {/* Job Detail Modal */}
            <CurrentJobDetail isOpen={isDetailModalOpen} jobData={selectedJob} onClose={() => setIsDetailModalOpen(false)} onConfirm={handleUpdateJob} onOpenFinish={handleOpenFinish} onDelete={handleDeleteCurrent} />
            <HistoryJobDetailModal isOpen={isHistoryModalOpen} jobData={selectedJob} onClose={() => setIsHistoryModalOpen(false)} onDelete={handleDeleteHistory} />
            {/* Finish Job Modal */}
            <FinishJobModal isOpen={isFinishModalOpen} job={jobToFinish} onClose={() => setIsFinishModalOpen(false)} onFinish={handleFinishJob}
            />
        </div>
        </div>
    );
}
export default Page;
