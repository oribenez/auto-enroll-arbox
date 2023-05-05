import dotenv from "dotenv";
import fs from "fs";
import { Cron } from "croner"; 

import { addDays, format, subSeconds } from "date-fns";

dotenv.config();

const SCHEDULE_FILE = "./data/schedule.json";
const JOBS_FILE = "./data/jobs.json";
const REGISTER_TIME = "16:10:00";
const TIMEZONE = "Asia/Jerusalem";

let user = {
	creds: {
		email: process.env.ARBOX_USER_EMAIL,
		password: process.env.ARBOX_USER_PASSWORD,
	},
	id: undefined,
	token: "",
	refreshToken: "",
	membership_id: undefined,
};

const COACH_PRIORITIES = [
	"עמית גורן",
	"רועי אופנהיימר",
	"עומרי פלד",
	"דניאל טנג'י",
	"עומר לנדאו",
	"מתן קדים",
	"אורפז איבגי",
];

export const loginArbox = async () => {
	try {
		const response = await fetch(
			"https://apiappv2.arboxapp.com/api/v2/user/login",
			{
				method: "POST",
				headers: {
					Accept: "application/json, text/plain, */*",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(user.creds),
			}
		);

		if (response.status !== 200) {
			throw new Error();
		}

		const responseData = await response.json();

		const userMembership = await getArboxMembership(
			responseData.data.token,
			responseData.data.refreshToken
		);
		//save data
		user = {
			...user,
			...responseData.data,
			membership_id: userMembership.id,
		};

		console.log("user: ", user);
		console.log("User logged in succesfully.");
	} catch (e) {
		console.log("Login failed.");
	}
};

export const createEnrollmentJobs = async () => {
	if (!user.token) await loginArbox();

	fs.readFile(
		SCHEDULE_FILE,
		"utf8",
		async function readFileCallback(err, data) {
			if (err) {
				console.log(err);
			} else {
				let schedule = JSON.parse(data);

				console.log("Desired schedule: ", schedule);
				const tomorrow_date = format(addDays(new Date(), 1), "yyyy-MM-dd");
				//search if there is a scheduled training enrollment for tomorrow
				for (const classObj of schedule.classes) {
					if (classObj.date === tomorrow_date) {
						// the user wants to join a specific class tomorrow

						const boxSchedule = await getArboxScheduleByDate(tomorrow_date);
						let optionalClasses = [];
						for (const boxClass of boxSchedule) {
							// console.log("FirstClass: ",boxSchedule[0]);
							if (
								boxClass.time === classObj.start_time &&
								boxClass.box_categories.name.trim() === classObj.class_name
							) {
								optionalClasses.push(boxClass);
							}
						}

						if (optionalClasses.length === 0) {
							console.log(
								"no matching classes found for the time " + classObj.start_time
							);
							continue;
						}

						// select a class by preffered coach
						let selected_class = optionalClasses[0];
						// if prefferd coach not found so the first class will be chosen
						//this can happen if the coach of all of this trainings is not in the list of preffered coaches
						outer: for (const coach of COACH_PRIORITIES) {
							for (const currClass of optionalClasses) {
								if (currClass.coach && coach === currClass.coach.full_name) {
									selected_class = currClass;
									break outer;
								}
							}
						}

						//add enroll_job
						const newJob = {
							extras: null,
							membership_user_id: user.membership_id,
							schedule_id: selected_class.id,
						};
						addJob(newJob);
					}
				}
			}
		}
	);
};

const getArboxMembership = async (token, refreshtoken) => {
	try {
		const response = await fetch(
			"https://apiappv2.arboxapp.com/api/v2/boxes/80/memberships/1",
			{
				method: "GET",
				headers: {
					Accept: "application/json, text/plain, */*",
					"Content-Type": "application/json",
					accesstoken: token,
					refreshtoken: refreshtoken,
				},
			}
		);

		if (response.status !== 200) {
			throw new Error();
		}

		return (await response.json()).data[0];
	} catch (e) {
		console.log("Issue with getting arbox membership.");
	}
};

const getBoxLocationsIdFirst = async (token) => {
	try {
		const response = await fetch(
			"https://apiappv2.arboxapp.com/api/v2/boxes/locations",
			{
				method: "GET",
				headers: {
					Accept: "application/json, text/plain, */*",
					"Content-Type": "application/json",
					accesstoken: token,
				},
			}
		);

		if (response.status !== 200) {
			throw new Error();
		}

		return (await response.json()).data[0];
	} catch (e) {
		console.log("Issue with getting arbox locations.");
	}
};

const getArboxScheduleByDate = async (date) => {
	const date_normalized = date + "T00:00:00.000Z";

	const locationsBoxId = (await getBoxLocationsIdFirst(user.token))?.locations_box[0]?.id;

	const info = {
		from: date_normalized,
		locations_box_id: locationsBoxId,
		to: date_normalized,
	};

	try {
		const response = await fetch(
			"https://apiappv2.arboxapp.com/api/v2/schedule/betweenDates",
			{
				method: "POST",
				headers: {
					Accept: "application/json, text/plain, */*",
					"Content-Type": "application/json",
					accesstoken: user.token,
					refreshtoken: user.refreshToken,
				},
				body: JSON.stringify(info),
			}
		);

		if (response.status !== 200) {
			throw new Error();
		}

		return (await response.json()).data;
	} catch (e) {
		console.log("Issue with getting a schedule.");
	}
};

const addJob = (newJobData) => {
	fs.readFile(JOBS_FILE, "utf8", function readFileCallback(err, data) {
		if (err) {
			console.log(err);
		} else {
			let jobsList = JSON.parse(data).jobs; //now it an object

			//add job to list of jobs only if not exist
			for (const currJob of jobsList) {
				if (
					currJob.membership_user_id === newJobData.membership_user_id &&
					currJob.schedule_id === newJobData.schedule_id
				) {
					//job already exists, no need to add it to list
					console.log("Job exist");
					return;
				}
			}
			jobsList.push(newJobData); //add job since we have checked that it is unique

			// write it back
			const jobsDataUpdated = JSON.stringify({ jobs: jobsList });
			fs.writeFile(JOBS_FILE, jobsDataUpdated, "utf8", (err) => {
				if (err) console.log(err);
			});
		}
	});
};

const emptyJobsList = (newJobData) => {
	const jobsDataUpdated = JSON.stringify({ jobs: [] });
	fs.writeFile(JOBS_FILE, jobsDataUpdated, "utf8", (err) => {
		if (err) console.log(err);
	});
};

export const envokeJobs = async (timeIdleUntil) => {
	fs.readFile(JOBS_FILE, "utf8", async function readFileCallback(err, data) {
		if (err) {
			console.log(err);
		} else {
			let jobsList = JSON.parse(data).jobs; //now it an object
			for (const currJob of jobsList) {
				try {
					const response = await fetch(
						"https://apiappv2.arboxapp.com/api/v2/scheduleUser/insert",
						{
							method: "POST",
							headers: {
								Accept: "application/json, text/plain, */*",
								"Content-Type": "application/json",
								accesstoken: user.token,
								refreshtoken: user.refreshToken,
							},
							body: JSON.stringify(currJob),
						}
					);
					const responseData = await response.json();

					if (response.status === 200) {
						console.log("Enrolled succesfully!");
					} else {
						console.log(responseData.error.messageToUser);
					}
				} catch (e) {
					console.log("Issue with enrolling to specific class.");
				}
			}
			emptyJobsList();
		}
	});
};

export const scheduler = async () => {
	console.log("Waiting for the right time to start enrolling 🧭");

	const registerTimeHours = REGISTER_TIME.substring(0, 2);
	const registerTimeMin = REGISTER_TIME.substring(3, 5);
	const registerTimeSec = REGISTER_TIME.substring(6, 8);

	const CUT_SECONDS = 30;
	const cutTime = format(
		subSeconds(
			new Date(
				0,
				0,
				0,
				Number(registerTimeHours),
				Number(registerTimeMin),
				Number(registerTimeSec)
			),
			CUT_SECONDS
		),
		"ss mm HH"
	);

	//prepare jobs
	Cron(
		`${cutTime} * * *`, { timezone: TIMEZONE },
		async () => {
			console.log("Preparing classes info");
			// creating jobs
			await createEnrollmentJobs();
		}
	);

	//envoke jobs
	Cron(
		`${registerTimeSec} ${registerTimeMin} ${registerTimeHours} * * *`, { timezone: TIMEZONE },
		async () => {
			console.log("Enrolling classes");
			// envoking jobs
			await envokeJobs(REGISTER_TIME);
		}
	);
};
