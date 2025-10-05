// for reference : https://www.w3schools.com/nodejs/nodejs_mysql_create_table.asp 
// https://github.com/mysqljs/mysql
// https://www.geeksforgeeks.org/how-to-create-table-in-sqlite3-database-using-node-js/?ref=gcse_outind (BEST ONE)
import mysql from 'mysql';
import { executeQuery, closePool } from 'db_config.js';
import dotenv from 'dotenv';
dotenv.config();


export const createbusiness = async () => {
  const sql = `CREATE TABLE IF NOT EXISTS BUSINESS_TABLE (Business_ID INT AUTO_INCREMENT PRIMARY KEY,Business_Name VARCHAR(255) ,Business_Photo LONGTEXT);`;

  return executeQuery(sql);

};

export const createworker = async () => {
  const sql = `CREATE TABLE IF NOT EXISTS WORKER_TABLE (User_ID INT AUTO_INCREMENT PRIMARY KEY,Username VARCHAR(255) NOT NULL,Business_ID INT,Role INT,Hashed_Password VARCHAR(255) NOT NULL,FOREIGN KEY (Business_ID) REFERENCES BUSINESS_TABLE(Business_ID));`;

  return executeQuery(sql);

};

export const createjob = async () => {
  const sql = `CREATE TABLE IF NOT EXISTS JOB_TABLE (Job_ID VARCHAR(255) PRIMARY KEY, Business_ID INT, User_ID INT, Description VARCHAR(255) NOT NULL, Due_Date DATETIME,FOREIGN KEY (Business_ID) REFERENCES BUSINESS_TABLE(Business_ID), FOREIGN KEY (User_ID) REFERENCES WORKER_TABLE(User_ID));`;

  return executeQuery(sql);
};

export const createjobhistory = async () => {
  const sql = `CREATE TABLE IF NOT EXISTS JOB_HISTORY (History_ID INT AUTO_INCREMENT PRIMARY KEY,User_ID INT,Job_ID VARCHAR(255), Business_ID INT, Completion_Date DATETIME,Description VARCHAR(255),Remarks VARCHAR(255),FOREIGN KEY (User_ID) REFERENCES WORKER_TABLE(User_ID), FOREIGN KEY (Business_ID) REFERENCES BUSINESS_TABLE(Business_ID));`;
  return executeQuery(sql);
};

export const createsubscription_table = async () => {
  const sql = `CREATE TABLE IF NOT EXISTS SUBSCRIPTION_TABLE (Subscription_ID INT AUTO_INCREMENT PRIMARY KEY, Job_ID VARCHAR(255),Business_ID INT,Endpoint LONGTEXT NOT NULL,Auth_Key1 LONGTEXT NOT NULL,Auth_Key2 LONGTEXT NOT NULL,Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);`;

  return executeQuery(sql);
};

export const createnotification = async () => {
  const sql = `CREATE TABLE IF NOT EXISTS NOTIFICATIONS (Notification_ID INT AUTO_INCREMENT PRIMARY KEY,User_ID INT,Job_ID VARCHAR(255),Notification_Content VARCHAR(255) NOT NULL,Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,Is_Read BOOLEAN DEFAULT FALSE,FOREIGN KEY (User_ID) REFERENCES WORKER_TABLE(User_ID),FOREIGN KEY (Job_ID) REFERENCES JOB_TABLE(Job_ID));`;
  return executeQuery(sql);
};

export const createTokensTable = async () => {
  const sql = 'CREATE TABLE IF NOT EXISTS TOKENS (ID INT AUTO_INCREMENT PRIMARY KEY, User_ID INT, Token TEXT, Valid TINYINT(1),expiries DATETIME, FOREIGN KEY (User_ID) REFERENCES WORKER_TABLE(User_ID));'
    ;
  return executeQuery(sql)
}

export const deleteBusinesstable = async () => {
  const sql = 'DROP TABLE IF EXISTS BUSINESS_TABLE';
  return executeQuery(sql);
};

export const deleteWorkerstable = async () => {
  const sql = 'DROP TABLE IF EXISTS WORKER_TABLE';
  return executeQuery(sql);
};

export const deletejobstable = async () => {
  const sql = 'DROP TABLE IF EXISTS JOB_TABLE';
  return executeQuery(sql);
};

export const deletejobhistorytable = async () => {
  const sql = 'DROP TABLE IF EXISTS JOB_HISTORY';
  return executeQuery(sql);
};

export const deleteSubscriptionstable = async () => {
  const sql = 'DROP TABLE IF EXISTS SUBSCRIPTION_TABLE';
  return executeQuery(sql);
};

export const deleteNotificationstable = async () => {
  const sql = 'DROP TABLE IF EXISTS NOTIFICATIONS';
  return executeQuery(sql);
};

export const deleteTokensTable = async () => {
  const sql = 'DROP TABLE IF EXISTS TOKENS';
  return executeQuery(sql)
}
export const populateDatabase = async () => {
  try {

    // Insert into BUSINESS_TABLE
    const businessResult = await executeQuery(
      "INSERT INTO BUSINESS_TABLE (Business_Name, Business_Photo) VALUES (?, ?)",
      ['TechCorp', 'techcorp.png']
    );
    const businessId = businessResult.insertId;

    // Insert into WORKER_TABLE
    const workerResult = await executeQuery(
      "INSERT INTO WORKER_TABLE (Username, Business_ID,Role, Hashed_Password) VALUES (?, ?, ?, ?)",
      ['johndoe', businessId, 1, 'hashed_password']
    );
    const workerId = workerResult.insertId;

    // Insert into JOB_TABLE
    /*
    await executeQuery(
        "INSERT INTO JOB_TABLE (Job_ID, Business_ID, Description, Due_Date) VALUES (?,?,?, ?)",
        ['9', 2,'Fix server issues', '2025-03-01 12:00:00']
    );
     
    await executeQuery(
      "INSERT INTO JOB_TABLE (Job_ID,  Business_ID,Description, Due_Date) VALUES (?,?,?,?)",
      ['202',3,'Fix server issues','2025-03-01 12:00:00']
    );
  
    await executeQuery(
      "INSERT INTO JOB_TABLE (Job_ID, Business_ID,Description, Due_Date) VALUES (?,?, ?, ?)",
      ['228', 2,'Fix server issues', '2025-03-01 12:00:00']
    );
    
    await executeQuery(
      "INSERT INTO JOB_HISTORY (User_ID, Job_ID, Business_ID, Completion_Date, Remarks) VALUES (?, ?, ?, ?, ?)",
      [workerId, '202','2', '2025-02-01 18:00:00','Job Done']
    );
   
    */
    // Insert into JOB_HISTORY
    await executeQuery(
      "INSERT INTO JOB_HISTORY (User_ID, Job_ID, Business_ID, Completion_Date, Remarks) VALUES (?, ?, ?, ?, ?)",
      [workerId, '9', '2', '2025-02-01 18:00:00', 'Job completed successfully']
    );

    await executeQuery(
      "INSERT INTO JOB_HISTORY (User_ID, Job_ID, Business_ID, Completion_Date, Remarks) VALUES (?, ?, ?, ?, ?)",
      [workerId, '228', '2', '2025-02-01 18:00:00', 'Job completed successfully']
    );


    // Insert into SUBSCRIPTION_TABLE
    await executeQuery(
      "INSERT INTO SUBSCRIPTION_TABLE (Endpoint, Auth_Key1, Auth_Key2, Job_ID) VALUES (?, ?, ?, ?)",
      ['https://pushservice.com', 'authkey1', 'authkey2', '202']
    );

    // Insert into NOTIFICATIONS
    await executeQuery(
      "INSERT INTO NOTIFICATIONS (User_ID, Job_ID, Notification_Content) VALUES (?, ?, ?)",
      [workerId, '202', 'New job assigned to you']
    );

    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Error populating database:', error.message);
  } finally {
    db.end();
  }
};


//run create func

(async () => {
  //await deleteNotificationstable();
  //await deleteSubscriptionstable();
//   await deletejobhistorytable();
  //await deletejobstable();
  //await deleteTokensTable();
  //await deleteWorkerstable();
  //await deleteBusinesstable();
  await createbusiness();
  await createworker();
  await createTokensTable();
  await createjob();
  await createjobhistory();
  await createsubscription_table();
  await createnotification();
  //await populateDatabase();
})();

