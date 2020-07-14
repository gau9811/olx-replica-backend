# olx-replica-backend
this is olx-replica using aws-s3-bucket to upload photos and mongodb to upload data simuntaneously. and uses nodemailer to send email after user register and send email when user join the room for chat, The chat uses socket.io to deliver the msg and the authentication section has three types of authentication google-Oauth, facebook-Oauth, and  normal login system the tech use for authentication is passport.js  and for routing it use express.js

to run this application....

Run this commands
1) npm install or npm i
2) user your own api key to acess service = aws-s3,nodemailer,google-Oauth,facebook-Oauth,
