import { API_CONFIG } from "../config";

export const updateWip = (id, objToUpdate, token) => {
  // console.log(objToUpdate);
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  myHeaders.append("Authorization", `Bearer ${token}`);
  var raw = JSON.stringify(objToUpdate);

  var requestOptions = {
    method: "PUT",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return fetch(
    API_CONFIG.baseUrl + "/inventoryWips/" + id,
    requestOptions
  ).then((response) => {
    //   if (!response.ok) {
    //     throw new Error("login failed");
    //   }
    return response.json();
  });
};
