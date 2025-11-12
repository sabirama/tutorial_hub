const setAuth = (authData, remember) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("auth", JSON.stringify(authData));
}

const getAuth = () => {
    const key = localStorage.getItem("auth") || sessionStorage.getItem("auth");
    return key ? JSON.parse(key) : null;
}

const logout = () => {
    localStorage.removeItem("auth");
    sessionStorage.removeItem("auth");
    window.location.href = "/admin/login";
    alert("You have been logged out.");
}

const getUserId = () => {
    const token = sessionStorage.getItem('token');
    const userId = token?.split('|')[0]
   return userId || 0;
}

export { setAuth, getAuth, logout, getUserId };