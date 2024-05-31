function runGrpcCallWithDone(callMethod, requestData, validateResponse, done) {
  callMethod(requestData, (err, res) => {
    if (err) {
      done(err);
      return;
    }
    try {
      validateResponse(res);
      done();
    } catch (error) {
      done(error);
    }
  });
}

// because test.each do not support 'done'
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
exports.runGrpcCallWithDone = runGrpcCallWithDone;
