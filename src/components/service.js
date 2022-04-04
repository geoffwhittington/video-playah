async function appFetch(url, method, body) {
  let data = {};
  var request = {
    method: method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  if (body && (method === "post" || method === "patch")) request.body = body;
  // Try to get a token

  let response = await fetch(url, request);
  if (!response.ok) {
    if (response.status === 307) {
      window.location = response.location;
    }
    if (response.status === 401) {
      logout();
      window.location = "/Login";
    }
    if (response.status === 402) {
      window.location = "/Check";
    }
  }
  if (method !== "delete") data = await response.json();

  return {
    ok: response.ok,
    status: response.status,
    data: data,
  };
}

function isAuthenticated() {
  let auth = localStorage.getItem("auth");
  if (auth !== null) return true;

  // Try to get a token
  fetch(`${process.env.REACT_APP_API_SERVER}/api/session`, {
    method: "get",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // We have an existing session
      if (data.user) {
        login(data.user);
        return true;
      } else {
        localStorage.removeItem("auth");
      }
    })
    .catch((error) => {
      console.error(error);
    });
  return false;
}

function login(auth_state) {
  localStorage.setItem("auth", auth_state);
}

function logout() {
  // remove user from local storage to log user out
  localStorage.removeItem("auth");
}

export const userService = {
  login,
  logout,
  isAuthenticated,
  appFetch,
};
