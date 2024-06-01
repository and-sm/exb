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

Open https://and-sm.github.io/exb/

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


