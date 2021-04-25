# foodApplication
## Backend Application to manage Food product inventory and Ordering

##Project Dependencies:  

 -- #node.js installation:  
      https://nodejs.org/en/download/package-manager/  
 -- #Mongodb installation:  
      https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/#using-deb-packages-recommended  
 -- #Mongodb Atlas installtion:  
      https://www.mongodb.com/cloud/atlas/register  
 -- #POSTMAN installtion:  
      https://www.postman.com/downloads/  
      
 ##Steps to install project  
  - $ git clone https://github.com/fubuk-i/foodApplication.git   
  - $ cd foodApplication    
  - $ npm install  
   
  #Running the project  
  - $ npm start  
 
 ##Project Structure  
 .  
├── api  
│   ├── app-constants.js  
│   ├── config  
│   │   ├── config.development.js  
│   │   ├── index.js  
│   │   └── winston.js  
│   ├── controllers  
│   │   ├── foodCatalog  
│   │   │   └── index.js  
│   │   ├── foodOrder  
│   │   │   └── index.js  
│   │   └── test  
│   │       └── index.js  
│   ├── daos  
│   │   ├── index.js  
│   │   └── models.js  
│   ├── routes  
│   │   └── index.js  
│   ├── service  
│   │   ├── foodCatalog.service.js  
│   │   ├── foodOrder.service.js  
│   │   ├── test.service.js  
│   │   └── utils.js  
│   └── service-error-constants.js  
├── logs  
│   └── app.log  
├── package.json  
├── package-lock.json  
└── server.js  

##
