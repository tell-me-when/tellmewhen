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

export async function Register({
    businessName, subdomain, password,
    address = "", locationLink = "", phone = "", email = "", openingHours = "",
    tosAccepted,
})
// Creates a new business with the default username "admin"
{
    let data = null;

    await axios.post(endpoint + "/register",
        {
            name: businessName,
            username: "admin",
            password,
            subdomain,
            address, locationLink, phone, email, openingHours,
            tosAccepted,
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
    // Refresh expired access token. The server derives identity from the
    // refresh token cookie itself, so no body is needed. Uses raw axios
    // (not apiClient) deliberately — apiClient's interceptor calls this
    // function on 401, so routing it through apiClient would recurse.
    let data = null;

    await axios.post(endpoint + "/refresh").then(res => {data = res; console.log(data)})
    return data;
}