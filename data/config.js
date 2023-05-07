import dotenv from "dotenv";
dotenv.config();

export default {
  user_creds: {
    email: process.env.ARBOX_USER_EMAIL,
    password: process.env.ARBOX_USER_PASSWORD
  },
  registerTime: "11:58:00", //need to also change time in pubsub job excuter to wake up server
  timezone: "Asia/Jerusalem",
  coach_priorities: [
    "עמית גורן",
    "רועי אופנהיימר",
    "עומרי פלד",
    "דניאל טנג'י",
    "עומר לנדאו",
    "מתן קדים",
    "אורפז איבגי",
  ]
};