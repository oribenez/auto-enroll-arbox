
# Auto Enroll - Arbox app

An automated registartion to classes without the Arbox app.

#### Wait, what?
No more alaram clocks to remember enrolling to classes.

No more "The session is full" 🥺 or even worse "11 waitlist" 🤯

Just fill the schedule for the next week and it will register for you to your desired class at the specified time.

#### Oh, wow that's awesome 🥳

## Where we start?

1. Clone repository OR download ZIP
2. run ```npm install```
3. Update the files:

    3.1. *"sample.env"*: change it's name to *".env"*, and insert the details
        
        ARBOX_USER_EMAIL="your arbox email here"
        ARBOX_USER_PASSWORD="your arbox password here"
        ALERTZY_ACCOUNT_KEY="Alertzy app key"

+ Alertzy app is availble for free on IOS just download it from the App-Store and get the Account key and place it in the ".env" file. This part is optional, but it is recommended so you can get push notifications for every succesfull enrollment to a class.


3.2. *"schedule.js.sample"*: change it's name to *"schedule.js"*, and update your schedule for the next week classes.
    
    Schedule variables:

+ __class_name__: Exact name of the class as it in the app

+ __date__: date of the class (Year-Month-Day: yyyy-MM-dd), for example: May 7th, 2023 wil be written as "2023-05-07".

+ __start_time__: The exact starting time of the class (as it appears in the Arbox app)
        
        {
            "class_name": "WOD",
            "date": "2023-05-07",
            "start_time": "08:30"
        }
4. run ```npm start```
5. The app will now register every day to classes at the time which is specified in the *config.js* file.



## Config file

* Set *registerTime* - the exact time that the app will enroll to classes
* Set *coach_priorities* in the config file you can add your preffered coaches in ascending order, this just in case that there will be a couple of classes at the same time so the app will choose the one with your preffered coach.

## App behavior

* __The app will create a list of jobs to do exactly 30 seconds before the specified registration time__, this behavior is applied to make sure that the app will register as soon as possible to classes withou the need to prepare things at the critical registartion time.
* The app is using a cron job scheduler to enroll to classes at a specified time so make sure it is up (_at least 30 seconds_ before registartion time) while you are close the registartion time.