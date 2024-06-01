function runGrpcCall(callMethod, requestData) {
  return new Promise((resolve, reject) => {
    callMethod(requestData, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

exports.runGrpcCall = runGrpcCall;
