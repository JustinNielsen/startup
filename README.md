# Goal Tracker

## SSH Into the Server
ssh -i ~/Documents/keys/production.pem ubuntu@18.190.146.155

## Design

Have you ever wanted to have a way to organize and store your goals online. This goal application will provide a convenient way for you to
store and keep track of your goals. My hope is that using this application will help you become a better person every single day because it
is the small things we do every day that determine our future. Not only will you be able to store your goals you will also be able to see
personalized statistics of the progress you have made.

![Design for a simple goal application](startup_design.png)

## Key Features:

- Secure login over HTTPS
- Display goals
- Goals are persistently stored
- Real time statistics of goals completed by all users
- Information provided by a web service
