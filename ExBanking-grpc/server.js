const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { initializeDb } = require("./db");
const rpc = require("./rpc/rpc.js");
const PROTO_PATH = __dirname + "/protos/user.proto";

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const user_proto = grpc.loadPackageDefinition(packageDefinition).user;

async function main() {
  await initializeDb();
  let server = new grpc.Server();
  server.addService(user_proto.UserService.service, {
    CreateUser: rpc.createUser,
    DepositUser: rpc.deposit,
    WithdrawUser: rpc.withdraw,
    SendFunds: rpc.send,
    UserBalance: rpc.balance,
  });
  server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err != null) {
        return console.error(err);
      }
      console.log(`gRPC listening on ${port}`);
    },
  );
}

main();
