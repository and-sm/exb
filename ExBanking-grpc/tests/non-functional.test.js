require("dotenv").config();
const {
  uniqueNamesGenerator,
  names,
  starWars,
} = require("unique-names-generator");
const { user_proto } = require("../client");
const grpc = require("@grpc/grpc-js");
const { runGrpcCall } = require("./utils");
const { exec } = require("child_process");

const client = new user_proto.UserService(
  process.env.GRPC_HOST,
  grpc.credentials.createInsecure(),
);

test("UserBalance should respond within 200ms", async () => {
  const randomName = uniqueNamesGenerator({ dictionaries: [names, starWars] });
  const user = await runGrpcCall(client.CreateUser.bind(client), {
    name: randomName,
  }).then((res) => res);
  const start = Date.now();
  const balance = await runGrpcCall(client.UserBalance.bind(client), {
    uuid: user.uuid,
  });
  expect(balance.amount).toBe(0);
  const end = Date.now();
  expect(end - start).toBeLessThan(200);
});

// describe('Load testing', () => {
//     jest.setTimeout(50000);
//
//     test('Run load test for user creation', (done) => {
//         exec('artillery run artillery.yml', (error, stdout, stderr) => {
//             if (error) {
//                 console.error(`Error: ${error}`);
//                 return done(error);
//             }
//             if (stderr) {
//                 console.error(`Stderr: ${stderr}`);
//                 return done(new Error(stderr));
//             }
//             console.log(`Stdout: ${stdout}`);
//             done();
//         });
//     });
// });
