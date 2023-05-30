import dotenv from "dotenv";
dotenv.config();

export default {
  user_creds: {
    email: process.env.ARBOX_USER_EMAIL,
    password: process.env.ARBOX_USER_PASSWORD
  },
  alertzyAccountKey: process.env.ALERTZY_ACCOUNT_KEY,
  registerTime: "21:00:00", // Exact time of registration (!important)
  remindersTime: "10:00:00",
  maxClassesPerMonth: 17,
  // Your preffered coaches by priority on ascending order. 
  // Make sure the names appear axactly like in the Arbox app, (no need to mention all of them, only those you like)
  coach_priorities: 
  [ 
    "עמית גורן",
    "רועי אופנהיימר",
    "עומרי פלד",
    "דניאל טנג'י",
    "עומר לנדאו",
    "מתן קדים",
    "אורפז איבגי",
  ],
  timezone: "Asia/Jerusalem",
};
