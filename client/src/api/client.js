const API_URL = import.meta.env.VITE_API_URL || "";

export async function api(path, {method = "GET",body}={}) {
    const token = localStorage.getItem("token");


    const res = await fetch(`${API_URL}${path}`,{
        method,
        headers:{
            ...(body &&{"Content-Type": "application/json"}),
            ...(token &&{Authorization: `Bearer ${token}`}),
        },
    body: body ? JSON.stringify(body):undefined,
    });

    if (res.status === 204)return null;
    const data = await res.json().catch(()=>({}));
    if (!res.ok){
        const error = new Error(data.message || "Request failed");
        error.status = res.status;
        throw error;
    } 
    return data
}
