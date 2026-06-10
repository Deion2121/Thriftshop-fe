export const getCookie = (name) => {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const cookie = cookies.find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
};

export const csrfHeaders = () => {
  const csrfToken = getCookie("csrfToken");
  return csrfToken ? { "X-CSRF-Token": csrfToken } : {};
};
