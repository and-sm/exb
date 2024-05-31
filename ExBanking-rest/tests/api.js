require('dotenv').config();

const url = process.env.HOST;

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json;charset=UTF-8",
};

const postCreateUser = (body) =>
  new Promise((resolve, reject) => {
    fetch(`${url}/create_user`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: headers,
    })
      .then((response) =>
        response.json().then((data) => ({
          status: response.status,
          data,
        })),
      )
      .then(({ status, data }) => {
        if (status >= 400) {
          resolve({ status, error: data.error || "Unknown error" });
        } else {
          resolve({ data: data, status: status });
        }
      })
      .catch((error) => reject({ status: 500, error: error.message }));
  });

const postDeposit = (body) =>
  new Promise((resolve, reject) => {
    fetch(`${url}/deposit`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: headers,
    })
      .then((response) =>
        response.json().then((data) => ({
          status: response.status,
          data,
        })),
      )
      .then(({ status, data }) => {
        if (status >= 400) {
          resolve({ status, error: data.error || "Unknown error" });
        } else {
          resolve({ data: data, status: status });
        }
      })
      .catch((error) => reject({ status: 500, error: error.message }));
  });

const postSend = (body) =>
  new Promise((resolve, reject) => {
    fetch(`${url}/send`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: headers,
    })
      .then((response) =>
        response.json().then((data) => ({
          status: response.status,
          data,
        })),
      )
      .then(({ status, data }) => {
        if (status >= 400) {
          resolve({ status, error: data.error || "Unknown error" });
        } else {
          resolve({ data: data, status: status });
        }
      })
      .catch((error) => reject({ status: 500, error: error.message }));
  });

const getBalance = (uuid) =>
  new Promise((resolve, reject) => {
    fetch(`${url}/get_balance?uuid=${uuid}`, {
      method: "GET",
      headers: headers,
    })
      .then((response) =>
        response.json().then((data) => ({
          status: response.status,
          data,
        })),
      )
      .then(({ status, data }) => {
        if (status >= 400) {
          resolve({ status, error: data.error || "Unknown error" });
        } else {
          resolve({ data: data, status: status });
        }
      })
      .catch((error) => reject({ status: 500, error: error.message }));
  });

exports.postCreateUser = postCreateUser;
exports.postSend = postSend;
exports.postDeposit = postDeposit;
exports.getBalance = getBalance;
