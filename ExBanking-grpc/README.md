### **How to run:**

- Use node 20+
- Execute in terminal to run backend:

  ```bash
  npm i
  npm start
  ```

- Execute in terminal to run tests:
  ```bash
  npm test
  ```

### **Tests list:**

Open tests_list.html in any browser.

### **Known issue:**

The functional test configured for Artillery library does not run on the gRPC backend. I used a patched version (github://artillery-engine-grpc), but no luck at this moment.

### **Tests output example:**

```bash
PASS  tests/user.send.test.js
PASS  tests/non-functional.test.js
PASS  tests/user.create.test.js

Test Suites: 3 passed, 3 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        0.598 s, estimated 1 s
Ran all test suites.
```


ExBanking test cases body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; } .container { display: flex; flex-direction: column; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); max-width: 800px; width: 100%; margin-top: 20px; } h1, h4, h5, h6 { margin-top: 0; } code { background-color: #f8f8f8; border-radius: 4px; } .step { margin-bottom: 0; } pre { background-color: #f8f8f8; padding: 10px; border-radius: 4px; overflow-x: auto; } .test { display: flex; flex-direction: column; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); max-width: 95%; width: 100%; margin-top: 20px; } .chip { display: inline-block; width: 70px; padding: 0 25px; margin-left: 10px; height: 24px; font-size: 14px; line-height: 24px; border-radius: 16px; background-color: #618f5a; color: #ffffff; position: relative; }

ExBanking test cases
====================

Functional tests: User creation.
--------------------------------

automated

### #1. Ensure that user can be created by executing API request.

**Step:**

Execute unary "CreateUser" RPC call.

    {"name": "Test user"}

**Expected result:**


    {
        "name": "Test user",
        "uuid": "92011dc9-42e5-4de2-b4c9-31fcbea5b7b3"
    }


**Checklist:**

*   **name** is the same as used in request.
*   Response has **uuid** key with generated value.

### #2. Incorrect request.

**Step:**

Execute unary "CreateUser" RPC call without the "name" key.

    {"name1": "Test user"}{}

**Expected result:**

    {"message": "Bad request"}

**Checklist:**

*   Response has **message** key with "Bad request" value.
*   RPC status: INTERNAL

### #3. Creation of an existing user.

**Preconditions:**

Execute unary "CreateUser" RPC call, save user's name.

**Step:**

Create another user with the same name.

**Expected result:**

    {"message": "User already exists"}

**Checklist:**

*   Response has **message** key with "User already exists" value.
*   RPC status: ALREADY\_EXISTS.

Functional tests: User balance
------------------------------

### #4. Get user balance.

**Preconditions:**

Existing user with funds.

**Step:**

Execute unary "UserBalance" RPC call

    {"uuid": 92dd0f99-d0cd-4d6e-9403-f94415239673}

**Expected result:**


    {
      "uuid": "92dd0f99-d0cd-4d6e-9403-f94415239673",
      "amount": 100
    }


**Checklist:**

*   Response has correct **uuid** key, same as used before for RPC call.
*   Response has **amount** key with number value.

### #5. Get balance of non-existing user.

**Step:**

    {"uuid": "not-existing-uuid"}

**Expected result:**

    {"error": "User not found"}


**Checklist:**

*   Response has **message** key with "User not found" value.
*   RPC status: NOT\_FOUND.

Functional tests: Deposit
-------------------------

### #6. Deposit funds to user.

**Preconditions:**

Existing user, remember its funds amount value.

**Step:**

Execute unary "DepositUser" RPC call.

    {"uuid": "8bb33ea8-96c9-4489-a246-bf27b07efc12", "amount": 10}

**Expected result:**

RPC status: OK.

### #7. Not a number for amount value.

**Preconditions:**

Existing user.

**Step:**

Execute unary "DepositUser" RPC call with NaN for amount.

    {"uuid": "8bb33ea8-96c9-4489-a246-bf27b07efc12", "amount": "word"}

**Expected result:**

    {"message": "Not a number"}

**Checklist:**

*   Response has **message** key with "Not a number" value.
*   RPC status: INTERNAL

### #8. Not existing user.

**Step:**

Execute unary "DepositUser" RPC call with wrong uuid.

    {"uuid": "wrong_uuid", "amount": 10}

**Expected result:**

    {"message": "User not found"}


**Checklist:**

*   Response has **message** key with "User not found" value.
*   RPC status: NOT\_FOUND.

### #9. Deposit zero value.

**Step:**

Execute unary "DepositUser" RPC call with zero amount.

    "uuid": "8bb33ea8-96c9-4489-a246-bf27b07efc12", "amount": 0}

**Expected result:**

    {"message": "Bad request"}


**Checklist:**

*   Response has **message** key with "Bad request" value.
*   RPC status: INTERNAL.

Functional tests: Withdraw
--------------------------

### #10. Withdraw funds from user.

**Preconditions:**

Existing user, remember its funds amount value.

**Step:**

Execute unary "WithdrawUser" RPC call

    {"uuid": "8bb33ea8-96c9-4489-a246-bf27b07efc12", "amount": 10}

**Expected result:**

RPC status: OK.

### #11. Not a number for amount value.

**Preconditions:**

Existing user

**Step:**

Execute unary "WithdrawUser" RPC call with NaN for amount

    {"uuid": "8bb33ea8-96c9-4489-a246-bf27b07efc12", "amount": "word"}

**Expected result:**

    {"message": "Not a number"}


**Checklist:**

*   Response has **message** key with "Not a number" value.
*   Make UseBalance RPC call to check user amount, value should remain unchanged.
*   RPC status: INTERNAL.

### #12. Not existing user.

**Step:**

Execute unary "WithdrawUser" RPC call with NaN with incorrect uuid.

    POST /withdraw {"uuid": "wrong_uuid", "amount": 10}

**Expected result:**

    {"message": "User not found"}


**Checklist:**

*   Response has **message** key with "User not found" value.
*   RPC status: NOT\_FOUND.

### #13. Withdraw zero value.

**Step:**

Execute unary "WithdrawUser" RPC call with zero amount

    POST /withdraw {"uuid": "8bb33ea8-96c9-4489-a246-bf27b07efc12", "amount": 0}

**Expected result:**

    {"message": "Bad request"}


**Checklist:**

*   Response has **message** key with "Bad request" value.
*   RPC status: INTERNAL.

Functional tests: Transfer
--------------------------

automated

### #14. Transfer funds from one user to another.

**Preconditions:**

Existing two users, remember theirs funds amount values.

**Step:**

Execute unary "SendFunds" RPC call.

    {"fromId": "aa04ae5c-b1cc-4dc1-8328-343c25ebc0d4", "toId": "e51e5015-68f2-4e9e-9f74-57511ef6325e", "amount": 50}

**Expected result:**

RPC status: OK.

### #15. Incorrect request.

**Step:**

Execute unary "SendFunds" RPC call without necessary keys.

    {}{"fromId": "1"}{"fromId": "1", "amount": 10}{"fromId": "1", "toId": "2"}{"toId": "2", "amount": 10}{"toId": "2"}{"amount": 10}

**Expected result:**

    {"message": "Bad request"}

**Checklist:**

*   Response has **message** key with "Bad request" value.
*   RPC status: 400.

### #16. Send funds to non-existing user.

**Step**

Execute unary "SendFunds" RPC call with incorrect uuid.

    {"fromId": "1", "toId": "non-exist", "amount": 10}

**Expected result:**

    {"message": "User not found"}

**Checklist:**

*   Response has **message** key with "User not found" value.
*   RPC status: NOT FOUND.

### #17. Send zero amount.

Execute unary "SendFunds" RPC call with zero amount.

    {"fromId": "1", "toId": "2", "amount": 0}

**Expected result:**

    {"message": "Bad request"}

**Checklist:**

*   Response has **message** key with "Bad request" value.
*   RPC status: INTERNAL.

### #18. Send negative amount.

Execute unary "SendFunds" RPC call with negative amount.

    {"fromId": "1", "toId": "2", "amount": -100}

**Expected result:**

    {"message": "Amount must be positive"}

**Checklist:**

*   Response has **message** key with "Amount must be positive" value.
*   RPC status: INTERNAL.

### #19. Insufficient funds.

    {"fromId": "1", "toId": "2", "amount": 1000}

Execute unary "SendFunds" RPC call with amount value more than user have.

**Expected result:**

    {"message": "Insufficient funds"}

**Checklist:**

*   Response has **message** key with "Amount must be positive" value.
*   RPC status: INTERNAL.

Non-functional tests
--------------------

automated

### #20. UserBalance response time.

**Preconditions:**

Existing user.

**Step:**

Execute unary "UserBalance" RPC call.

**Checklist:**

*   User balance API route should respond within 200ms.

### #21. Load test for user creation.

**Step:**

Perform load testing of CreateUser using artillery library.

**Checklist:**

Overview results of artillery metrics. Count of operations should be the same as mentioned below:

*   execution count: 25 (same as requests value).
*   response time: not bigger than 100ms.