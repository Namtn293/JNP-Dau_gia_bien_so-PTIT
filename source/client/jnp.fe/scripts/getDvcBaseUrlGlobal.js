function getDvcBaseUrlGlobal() {
  console.log("VITE_API_DVC_URL::", window.ENV?.VITE_API_DVC_URL)
  if(window.ENV?.VITE_API_DVC_URL) 
    return window.ENV?.VITE_API_DVC_URL;
  return 'https://eformapi.zamiga.vn';
}