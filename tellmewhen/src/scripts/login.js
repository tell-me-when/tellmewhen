import axios from "axios";
axios.defaults.withCredentials = true;
import { GetServerEndpoint } from "./script-settings";
let endpoint = GetServerEndpoint();

export async function Login(name, businessName, password)
{
    let data = null;

    await ClearCookies()
    await axios.post(endpoint + "/login",
        {
            name: businessName,
            username: name,
            password: password
        }
    ).then(res => {
        localStorage["businessID"] = res.data["businessId"]
        localStorage["userID"] = res.data["userId"]
        localStorage["username"] = name;
        data = res;
        localStorage["loggedIn"] = true;
    })
    return data;
}

export async function Register(username, password)
// Creates a new business with the default username "admin"
{
    let data = null;

    await axios.post(endpoint + "/register",
        {
            name: username,
            username: "admin",
            password: password
        }
    ).then(async res => {
        data = res;
    })
    return data;

}
export async function ClearCookies()
// Creates a new business with the default username "admin"
{
    let data = null;

    await axios.post(endpoint + "/clearCookies").then(res => data = res);
    return data;
}

export async function RefreshToken() 
{
    // Refresh expired access token
    let data = null;

    await axios.post(endpoint + "/refresh",
        {
            username: localStorage["username"],
            userId: localStorage["userID"],
            businessId: localStorage["businessID"]
        }
    ).then(res => {data = res; console.log(data)})
    return data;
}

export async function HandleUnauthorised()
{
    // func will be the original function
    let tryRefresh = await RefreshToken();
    if(tryRefresh.status === 201)
    {
        window.location.reload();
    }
    else
    {
        window.location.href = "/auth";
        return;
    }
}