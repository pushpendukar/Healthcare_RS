# Healthcare_RS
A case study on Healthcare Recommender Systems

## URL of the system

If you want to use the system online, please go to [http://101.43.9.203:1266/login.html](http://101.43.9.203:1266/login.html).

## Reference of the external resources

### The data source

#### Doctor Information

[haodf.com](https://www.haodf.com/doctor/list-3302.html)

#### Disease-Symptom Information

[Openkg](http://openkg.cn/dataset/disease-information)

### Front-end external package

[bootstrap](https://getbootstrap.com/)

## Deployment of Server, Database, and Recommendation System

The server and recommendation system shall be deployed on the same device, allowing them to use 127.0.0.1:port to visit each other. The database can be deployed on the same or a distinct device based on your configuration.

server port: 1266

database port: 3306 (MySQL)

recommendation port: 8848

### Environment for the Database

##### MySQL Version

5.5.60 or 5.5.62

##### Establish the database

If you want to run the program locally, you may need to establish a database on your own or contact the team first, as the database currently used by the team might be set to be restricted from visiting using unverified IP.

To establish the database, you may utilize the .sql files in the [database directory](./database), which includes [grp_doctor.sql](./database/grp_doctor.sql), [grp_doctormodify.sql](./database/grp_doctormodify.sql), [grp_doctortags.sql](./database/grp_doctortags.sql), [grp_doctorupdates.sql](./database/grp_doctorupdates.sql), and [grp_hospital.sql](./database/grp_hospital.sql).

##### Config the database

If you have set up your own database, to config your database in the server, please use [database.js](./database.js) under the root directory.

```javascript
const pool = mysql.createPool({
    host: 'your host',
    user: 'user',
    password: 'your password',
    database: 'your database'
})
```

### Environment for the NodeJS Server

##### Node Version

18.6.0

##### Instructions for installing dependencies

```
npm install
```

##### Dependencies list for NodeJS Server

Please refer to [package-lock.json](./package-lock.json) under the root dir.

##### Instructions to run the server locally

```
node server.js
```

##### Documentation

See details in swagger.json under the root dir.

#### **For Developers, you may directly visit the [swagger.json](./swagger.json) in Git for details! As it will get updated fastest.**

For a UI version, you may visit [here](http://101.43.9.203:1266/api-docs/).

If you can run the server locally, you may visit [here](http://localhost:1266/api-docs/).

##### Other Settings

Note that in [constant.js](./static/js/constant.js), there is a variable address, which determines the IP address that the front end would use as part of the urls to send requests to the backend server. You may need to modify it based on your deployment device's IP.

You may also need to change the blockChainServiceURL in the [config.js](./config.js) according to the device where you deploy the block chain service.


### Environment for Recommender

##### Python Version

3.9.13

##### Instruction for importing Packages

In the terminal, find the location of the [requirements.txt](./Recommender/requirements.txt) and run by the following instruction:

```
pip install -r requirements.txt
```

##### Instructions to run the recommender locally

Please change the path (./Recommender/Recommender_System_API.py) and find the file [Recommender_System_API.py](./Recommender/Recommender_System_API.py).

```
python Recommender_System_API.py
```

### Environment for Blockchain

##### Instruction for running the blockchain

Open the terminal as administrator, go to the path of ’/blockchain’, run the file by using following instruction:

```
npm install
npm install forever
node API.js
```

