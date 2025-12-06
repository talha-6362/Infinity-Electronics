export const BASE_URL = "http://localhost:5000/api";




export const apiGet = async (endpoint, token = null) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        ...(token && { "Authorization": "Bearer " + token }),
      },
    });
    return await res.json();
  } catch (err) {
    console.error("API GET Error:", err);
    throw err;
  }
};




export const apiPost = async (endpoint, data, token = null) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": "Bearer " + token })
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err) {
    console.error("API POST Error:", err);
    throw err;
  }
};


export const apiPut = async (endpoint, data, token = null) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { "Authorization": "Bearer " + token })
      },
      body: JSON.stringify(data)
    });
    return await res.json();
  } catch (err) {
    console.error("API PUT Error:", err);
    throw err;
  }
};


export const apiDelete = async (endpoint, token = null) => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        ...(token && { "Authorization": "Bearer " + token })
      }
    });
    return await res.json();
  } catch (err) {
    console.error("API DELETE Error:", err);
    throw err;
  }
};

export const apiFormData = async (endpoint, formData, token = null, method = "POST") => {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: {
        ...(token && { "Authorization": "Bearer " + token })
      },
      body: formData
    });

    return await res.json();
  } catch (err) {
    console.error("API FormData Error:", err);
    throw err;
  }
};
