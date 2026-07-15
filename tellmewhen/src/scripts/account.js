import apiClient from "./apiClient";

export async function GetAccountDetails()
{
    // This will return the Business Photo and name
    let data = null;
    await apiClient.get("/business/info")
    .then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}

export async function GetCurrentJobCount()
{
    // This will get the number of currently active job the whole business has
    let data = null;

    await apiClient.get("/jobs/open_jobs/" + localStorage["businessID"])
    .then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}

export async function GetTotalJobCount(){
    // This will get the total number of jobs ever posted by the whole business
    let data = null;

    await apiClient.get("/jobs/total_jobs/" + localStorage["businessID"])
    .then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}

export async function RenameAccount(name)
{
    // This will rename the business (not the employees username)
    let data = null;

    await apiClient.post("/business/change_name",
        {
            name: name,
        }
    ).then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}

export async function ChangeBusinessPhoto(photob64)
{
    // This will change the businesses photo to a base 64 encoded image
    let data = null;

    await apiClient.post("/business/change_photo",
        {
            newPhoto: photob64,
        }
    ).then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}

export async function DeleteBusiness()
{
    // Deletes the whole business
    let data = null
    await apiClient.post("/delete/" + localStorage["businessID"], {}, { timeout: 5000 })
    .then((res) => { data = res })
    .catch((err) => { data = err })
    return data;
}

export async function CreateEmployee(username, password, privilege)
{
    // This will create a new employee
    let data = null;

    await apiClient.post(
        "/business/addUser",
        {
            username: username,
            password: password,
            privLevel: privilege,
        }
    ).then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}

export async function EditEmployee()
{
    // Modifies an existing employee
}

export async function DeleteEmployee(targetID)
{
    // Deletes an employee — the caller's own identity comes from the auth
    // cookie server-side, so only the target needs to be sent.
    let data = null;

    await apiClient.post("/delete/user/" + targetID)
    .then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}

export async function SearchEmployee(userID, limit)
{
    // Searches for the employee in the database, (no UID will return all)
    let data = null;

    await apiClient.get("/business/search_employees", {
        params: { userId: userID, limit: limit },
    }).then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}

export async function GetEmployees()
{
    let data = null;

    await apiClient.get("/business/search_employees")
    .then(res => { data = res; })
    .catch(err => { data = err; })
    return data;
}

export async function GetPrivilegeLevel(userId)
{
    const employeesRes = await GetEmployees()

    // GetEmployees() resolves to an Axios error object (no .data) on
    // failure rather than throwing — guard against that instead of
    // crashing on employees.length.
    const employees = employeesRes?.data;
    if(!Array.isArray(employees)) return 0;

    for(let i = 0; i < employees.length; i++)
    {
        if(employees[i].User_ID == userId)
        {
            return employees[i].Role;
        }
    }
    return 0;
}

export async function ChangePassword(username, password, userId)
{
    let data = null;

    await apiClient.post("/business/change_password",
        {
            username: username,
            newPassword: password,
            userId: userId,
        }
    ).then((res) => {
        data = res;
    }).catch((err) => {
        data = err;
    });
    return data;
}
