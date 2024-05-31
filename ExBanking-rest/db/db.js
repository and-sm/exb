import { db } from "../server.js";
import { v4 as uuidv4 } from "uuid";

const checkAmountIsNegative = (amount, reject) => {
  if (amount <= 0) {
    reject(new Error("Amount must be positive"));
    return true;
  }
  return false;
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

export const sendFunds = (fromId, toId, amount) => {
  return new Promise((resolve, reject) => {
    if (checkAmountIsNegative(amount, reject)) {
      return;
    }
    if (typeof amount !== "number") {
      reject(new Error("Not a number"));
    }
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");
      db.get(
        "SELECT amount FROM users WHERE uuid = ?",
        [fromId],
        (err, row) => {
          if (err) {
            db.run("ROLLBACK");
            reject(err);
          } else if (!row || row.amount < amount) {
            db.run("ROLLBACK");
            reject(new Error("Insufficient funds"));
          } else {
            db.run(
              "UPDATE users SET amount = amount - ? WHERE uuid = ?",
              [amount, fromId],
              (err) => {
                if (err) {
                  db.run("ROLLBACK");
                  reject(err);
                } else {
                  db.run(
                    "UPDATE users SET amount = amount + ? WHERE uuid = ?",
                    [amount, toId],
                    (err) => {
                      if (err) {
                        db.run("ROLLBACK");
                        reject(err);
                      } else {
                        db.run("COMMIT");
                        resolve({ fromId, toId, amount });
                      }
                    },
                  );
                }
              },
            );
          }
        },
      );
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
