const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../protos/notification.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const notificationProto = grpc.loadPackageDefinition(packageDefinition);

function sendNotification(call, callback) {
  const { userId, email, message } = call.request;
  console.log(`Sending email to user ${userId}-${email}: ${message}`);
  // Here you would typically integrate with an email service
  callback(null, { success: true });
}

function main() {
  const server = new grpc.Server();
  server.addService(notificationProto.notification.NotificationService.service, {
    SendNotification: sendNotification
  });

  server.bindAsync('0.0.0.0:50052', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('Notification service running on port 50052');
  });
}

main();