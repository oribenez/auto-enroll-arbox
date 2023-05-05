import { Cron } from "croner";
import { addDays, format, subSeconds } from "date-fns";

import { scheduleClasses } from "../data/schedule.js";
import config from "../data/config.js";
const {
	user_creds,
	registerTime: REGISTER_TIME,
	timezone: TIMEZONE,
	coach_priorities: COACH_PRIORITIES,
} = config;

// global vars
let jobs = [];

let user = {
	creds: {
		email: user_creds.email,
		password: user_creds.password,
	},
	id: undefined,
	token: "",
	refreshToken: "",
	membership_id: undefined,
};

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

		console.log("User logged in succesfully.");
	} catch (e) {
		console.log("Login failed.");
	}
};

export const createEnrollmentJobs = async () => {
	if (!user.token) await loginArbox();

	let schedule = scheduleClasses;

	console.log("Desired schedule: ", schedule);
	const tomorrow_date = format(addDays(new Date(), 1), "yyyy-MM-dd");
	//search if there is a scheduled training enrollment for tomorrow
	for (const classObj of schedule) {
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

	const locationsBoxId = (await getBoxLocationsIdFirst(user.token))
		?.locations_box[0]?.id;

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
	//add job to list of jobs only if not exist
	for (const currJob of jobs) {
		if (
			currJob.membership_user_id === newJobData.membership_user_id &&
			currJob.schedule_id === newJobData.schedule_id
		) {
			//job already exists, no need to add it to list
			console.log("Job exist");
			return;
		}
	}
	jobs.push(newJobData); //add job since we have checked that it is unique
};

const emptyJobsList = (newJobData) => {
	jobs = [];
};

export const envokeJobs = async (timeIdleUntil) => {
	for (const currJob of jobs) {
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
				console.log("Enrolled succesfully! 🥳");
			} else {
				console.log(responseData.error.messageToUser);
			}
		} catch (e) {
			console.log("Issue with enrolling to specific class.");
		}
	}
	emptyJobsList();
};

export const scheduler = async () => {
	console.log("Waiting for the right time to start enrolling [" + REGISTER_TIME + "]🧭");

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
	Cron(`${cutTime} * * *`, { timezone: TIMEZONE }, async () => {
		console.log("[Preparing Jobs] Preparing classes info");
		// creating jobs
		await createEnrollmentJobs();
	});

	//envoke jobs
	Cron(
		`${registerTimeSec} ${registerTimeMin} ${registerTimeHours} * * *`,
		{ timezone: TIMEZONE },
		async () => {
			console.log("[Jobs Executer] Enrolling classes");
			// envoking jobs
			await envokeJobs(REGISTER_TIME);
		}
	);
};
