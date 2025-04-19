const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const nodemailer = require('nodemailer');

const PROTO_PATH = path.join(__dirname, './protos/notification.proto');

// SMTP Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || 'dineshbabu.thangavel@gmail.com',
    pass: process.env.SMTP_PASS || 'kock xexm tmob ylpi'
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const notificationProto = grpc.loadPackageDefinition(packageDefinition);

async function sendNotification(call, callback) {
  const { userId, email, message, subject } = call.request;
  console.log(`Sending email to user ${userId}-${email}: ${message}`);

  try {
    await transporter.sendMail({
      from: '"Dinesh" dineshbabu.thangavel@gmail.com',
      to: email,
      subject: subject || 'Notification from gRPC Service',
      text: message
    });

    callback(null, { success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    callback({
      code: grpc.status.INTERNAL,
      details: 'Failed to send email'
    });
  }
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