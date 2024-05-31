const PROTO_PATH = __dirname + "/protos/user.proto";

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const user_proto = grpc.loadPackageDefinition(packageDefinition).user;

module.exports.user_proto = user_proto;
