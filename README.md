# CSM-Utilization-and-Planning-Tool

## About
The purpose of this tool is to organize and visualize data on Bluemix Premium Support Contracts and Bluemix Client Success Managers (CSM) around the world to provide insights to the management team on how to best allocate CSMs. This tool can also be used by CSMs themselves to keep track of their own clients, utilization, milestones, issues and executive reporting.

This tool is integrated with [Engagement Tracking Application (ETA)](https://eta2.w3ibm.mybluemix.net) and all of the data analyzed in this application is pulled through [ETA's APIs](https://eta2-api.w3ibm.mybluemix.net). This application is hosted on a Bluemix Dedicated environment set up by the ETA Team. Instructions on how to call ETA's APIs as well as how to push this application onto the Bluemix Dedicated Environment can be found on the Github wiki.

### Viewing the application on Bluemix
Dev: https://csm-utilization-and-planning-tool.w3ibm.mybluemix.net
Prod: https://csm-utilization.w3ibm.mybluemix.net

### Deploying the application locally
To deploy the application on a local environment, first install all dependencies:
```
$ npm install
```

To run the application:

```
$ npm start
```

The application will deploy on http://localhost:8080

### Deploying the application to Bluemix
1. Download and install cli and webpack

    Install `cf` cli: https://github.com/cloudfoundry/cli

    Install webpack: https://webpack.js.org/guides/installation/

2. Change cloudfoundry api to point to Bluemix dedicated
    ```
    $ cf api https://api.w3ibm.bluemix.net
    ```

3. Go to root directory

    Set up GitHub Desktop and clone the `CSM-Utilization-and-Planning-Tool` project

    Open up your CLI and point to the project stored locally

4. Login to Bluemix

    ```
    $ cf login
    ```

   Enter your w3 login credentials when prompted (email and password)

   (If cf login does not work, try `$ cf login --sso`)

5. Select space to deploy to

    Select 3 for prod, or 2 for dev

6. Push application to Bluemix

    Enter command:
    ```
    $ cf push -p . -f manifest.prod.yml
    ```



Technologies Used:
* Angular JS 1.6.4 - Core Front End Framework
* Semantic UI 2.2.9 - Primary Styling for UI
* IBM North Star Web Styling
* JQuery 3.2.1 - Dependency for Semantic UI
* Vis.js 4.19.1 - For the timeline on the CSM Info Page
* d3 Infographics Vizuly radial progress
* Chart.js 2.5.0 - Used for Charts on the CSM Info Page
* tc-angular-chartjs - A plugin to connect Chart.js with Angular
* High Charts - Used for Graphs/Charts on the Reports PDFs
