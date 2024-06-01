import { db } from "../server.js";
import { v4 as uuidv4 } from "uuid";

const checkAmountIsNegative = (amount, reject) => {
  return amount <= 0;
};

// DEBUG
export const getAllUsers = () => {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM users", (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const createUser = (name, amount) => {
  return new Promise((resolve, reject) => {
    const uuid = uuidv4();
    db.run(
      "INSERT INTO users (name, amount, uuid) VALUES (?, ?, ?)",
      [name, 0, uuid],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ name, amount, uuid });
        }
      },
    );
  });
};

export const depositAmount = (uuid, amount) => {
  return new Promise(async (resolve, reject) => {
    if (checkAmountIsNegative(amount)) {
      reject(new Error("Amount must be positive"));
    }
    if (typeof amount !== "number") {
      reject(new Error("Not a number"));
    }
    try {
      await getUserBalance(uuid);
    } catch (err) {
      reject(err);
    }
    db.run(
      "UPDATE users SET amount = amount + ? WHERE uuid = ?",
      [amount, uuid],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ status: "ok" });
        }
      },
    );
  });
};

export const withdrawAmount = (uuid, amount) => {
  return new Promise(async (resolve, reject) => {
    if (checkAmountIsNegative(amount, reject)) {
      return;
    }
    if (typeof amount !== "number") {
      reject(new Error("Not a number"));
    }
    try {
      await getUserBalance(uuid);
    } catch (err) {
      reject(err);
    }
    db.run(
      "UPDATE users SET amount = amount - ? WHERE uuid = ? AND amount >= ?",
      [amount, uuid, amount],
      function (err) {
        if (err) {
          reject(new Error("Amount must be positive"));
        } else if (this.changes === 0) {
          reject(new Error("Insufficient funds"));
        } else {
          resolve({ status: "ok" });
        }
      },
    );
  });
};

export const getUserBalance = (uuid) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT amount FROM users WHERE uuid = ?", [uuid], (err, row) => {
      if (err) {
        reject(err);
      } else if (!row) {
        reject(new Error("User not found"));
      } else {
        resolve({ uuid: uuid, amount: row.amount });
      }
    });
  });
};

export const sendFunds = async (fromId, toId, amount) => {
  return new Promise((resolve, reject) => {
    if (checkAmountIsNegative(amount)) {
      reject(new Error("Amount must be positive"));
    }

    if (typeof amount !== "number") {
      reject(new Error("Amount must be a number"));
    }
    db.serialize(async () => {
      try {
        await runQuery("BEGIN TRANSACTION");

        const row = await getQuery("SELECT amount FROM users WHERE uuid = ?", [
          fromId,
        ]);
        if (!row || row.amount < amount) {
          reject(new Error("Insufficient funds"));
        }

        await runQuery("UPDATE users SET amount = amount - ? WHERE uuid = ?", [
          amount,
          fromId,
        ]);
        await runQuery("UPDATE users SET amount = amount + ? WHERE uuid = ?", [
          amount,
          toId,
        ]);

        await runQuery("COMMIT");
        resolve({ fromId, toId, amount });
      } catch (err) {
        await runQuery("ROLLBACK");
        reject(err);
      }
    });
  });
};

const runQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const getQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const getUserByName = (name) => {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM users WHERE name = ?", [name], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};
