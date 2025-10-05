// Get all open jobs for certain user id ( send empty paeameter for manager)
import { executeQuery, closePool } from 'db_config.js';


const {
  randomBytes,
} = await import('node:crypto');

    
const addNotification = async (userId, jobId, notificationContent) => {
    let sql = `INSERT INTO NOTIFICATIONS (User_ID, Job_ID, Notification_Content) VALUES (?, ?, ?);`;
    return executeQuery(sql, [userId, jobId, notificationContent]);
    };
  
// jobs per user or all jobs if no user ID 
const getOpenJobs = async (businessId, userId = null) => {
  let sql = `
    SELECT JOB_TABLE.Job_ID, JOB_TABLE.Description, JOB_TABLE.Due_Date
    FROM JOB_TABLE
    WHERE JOB_TABLE.Business_ID = ?
  `;

  const params = [businessId];

  if (userId) {
    sql += ' AND JOB_TABLE.User_ID = ?';
    params.push(userId);
  }
  console.log(`SQL: ${sql} with params, ${params}`)
  return executeQuery(sql, params);
};

// job history
const getJobHistory = async (businessId, userId = null) => {
  let sql = `
    SELECT 
      JOB_HISTORY.Job_ID, 
      JOB_HISTORY.Description, 
      JOB_HISTORY.Completion_Date, 
      JOB_HISTORY.Remarks
    FROM JOB_HISTORY
    WHERE JOB_HISTORY.Business_ID = ?
  `;

  const params = [businessId];

  if (userId) {
    sql += ' AND JOB_HISTORY.User_ID = ?';
    params.push(userId);
  }

  return executeQuery(sql, params);
};

// Function to create a new job
const generateUniqueJobId = async () => {
  let isUnique = false;
  let random_job_id;

  while (!isUnique) {
    random_job_id = randomBytes(16).toString('hex');

    const checkJobTableSql = `
      SELECT COUNT(*) AS count
      FROM JOB_TABLE
      WHERE Job_ID = ?;
    `;
    const checkHistoryTableSql = `
      SELECT COUNT(*) AS count
      FROM JOB_HISTORY
      WHERE Job_ID = ?;
    `;

    const jobTableResult = await executeQuery(checkJobTableSql, [random_job_id]);
    const historyTableResult = await executeQuery(checkHistoryTableSql, [random_job_id]);

    if (jobTableResult[0]["count"] == 0 && historyTableResult[0]["count"] == 0) {
      isUnique = true;
    }
  }

  return random_job_id;
};

const createNewJob = async (businessId, userId = null, description, dueDate) => {
    const randomJobId = await generateUniqueJobId();

    // Insert the new job into JOB_TABLE
    const sql = `
      INSERT INTO JOB_TABLE (Job_ID, Business_ID, User_ID, Description, Due_Date)
      VALUES (?, ?, ?, ?, ?);
    `;
    const result = await executeQuery(sql, [randomJobId, businessId, userId, description, dueDate]);
    console.log('New job created with ID:', randomJobId);
    return {
      result: result,
      randomJobId: randomJobId }
};

export const getCustomerJobDetails = async (jobId) => {
  const sql = `
    SELECT JOB_TABLE.Description, BUSINESS_TABLE.Business_Name, BUSINESS_TABLE.Business_ID
    FROM JOB_TABLE JOIN BUSINESS_TABLE ON JOB_TABLE.Business_ID = BUSINESS_TABLE.Business_ID 
    WHERE JOB_TABLE.Job_ID = ?`;

  return await executeQuery(sql, [jobId]);
}

const deletefromjobtable = async (jobId) => {
  const sql = `
    DELETE FROM JOB_TABLE
    WHERE Job_ID =?;
  `;
  return executeQuery(sql, [jobId]);
  console.log('Job deleted with ID:', jobId);
};

const deletefromjobhistorytable = async (jobId) => {
  const sql = `
    DELETE FROM JOB_HISTORY
    WHERE Job_ID =?;
  `;
  return executeQuery(sql, [jobId]);
  console.log('Job history deleted with ID:', jobId);
};


//----------------------------------------------------------------
const getJobDetails = async (jobId) => {
  const sql = `
    SELECT Job_ID, Description, Due_Date, User_ID
    FROM JOB_TABLE
    WHERE Job_ID = ?;
  `;

  const result = await executeQuery(sql, [jobId]);
  const parsedRes = result
  if ( parsedRes && parsedRes[0]) {
    return parsedRes[0]; 
  } else {
    return null; 
  }
};
//----------------------------------------------------------------

// assign  job
const assignJobToUser = async (userId, jobId) => {
  const sql = `
    UPDATE JOB_TABLE
    SET User_ID = ?
    WHERE Job_ID = ?;
  `;

  return executeQuery(sql, [userId, jobId]);
};

// mark a job as completed (moves it to job history and removes from current jobs)
const completeJob = async (userId, jobId, remarks = '') => {
  const selectJobSql = 'SELECT Business_ID, Description FROM JOB_TABLE WHERE Job_ID = ?;';
  const checkHistorySql = 'SELECT Job_ID FROM JOB_HISTORY WHERE Job_ID = ?;';
  const insertHistorySql = 'INSERT INTO JOB_HISTORY (User_ID, Job_ID, Business_ID, Completion_Date, Description, Remarks) VALUES (?, ?, ?, ?, ?, ?);';
  const deleteJobSql = 'DELETE FROM JOB_TABLE WHERE Job_ID = ?;';
  const deleteSubscriptionSql = 'DELETE FROM SUBSCRIPTION_TABLE WHERE Job_ID = ?;';
  // Check if the job exists in the JOB_TABLE
  console.log(`___________JOB  ID: ${jobId}`)
  const jobDetails = await executeQuery(selectJobSql, [jobId]);
  if (jobDetails.length === 0) {
    throw new Error(`Job with ID ${jobId} not found in JOB_TABLE.`);
  }
  console.log(`Business id ${jobDetails[0].Business_ID}`)
  // Check if the job already exists in the JOB_HISTORY table
  //const historyCheck = await executeQuery(checkHistorySql, [jobId]);
 
  // Insert the job into the JOB_HISTORY table
  await executeQuery(insertHistorySql, [
    userId,
    jobId,
    jobDetails[0].Business_ID,
    '2025-03-03',
    jobDetails[0].Description,
    remarks,
  ]);
  await executeQuery(deleteSubscriptionSql, [jobId]);
  await executeQuery(deleteJobSql, [jobId]);
  // Delete the job from the JOB_TABLE
  

  console.log(`Job ${jobId} completed and moved to history.`);
};

// get notifications for a job
const getNotifications = async (jobId) => {
  let sql = `
    SELECT Notification_Content, Timestamp, Is_Read
    FROM NOTIFICATIONS
    WHERE Job_ID = ?
    ORDER BY Timestamp DESC
  `;
  return executeQuery(sql, [jobId]);
};

const getSubscription = async (jobId, businessId) => {
  const sql = `
    SELECT 
      SUBSCRIPTION_TABLE.Subscription_ID, 
      SUBSCRIPTION_TABLE.Endpoint, 
      SUBSCRIPTION_TABLE.Auth_Key1, 
      SUBSCRIPTION_TABLE.Auth_Key2
    FROM SUBSCRIPTION_TABLE
    JOIN JOB_TABLE ON SUBSCRIPTION_TABLE.Job_ID = JOB_TABLE.Job_ID
    WHERE JOB_TABLE.Job_ID = ? AND JOB_TABLE.Business_ID = ?;
  `;

  return executeQuery(sql, [jobId, businessId]);
};
//----------------------------------------------------------------
//Token table helper functions
//----------------------------------------------------------------

//add a new valid token
const addToken = async(userId, token) => {
  const sql = `
  INSERT INTO TOKENS (User_ID,Token,Valid) 
  VALUES (?,?,1);`
  return executeQuery(sql,[userId,token])
}
//add a newly blacklisted token
const blockToken = async(token) =>{
    const sql = `
    UPDATE TOKENS
    SET Valid = 0
    WHERE Token = ?;
    `
    return executeQuery(sql,[token])
}

//freeze a user's tokens
const freezeUser = async(userId) =>{
  const sql = `
  UPDATE TOKENS
  SET Valid = 0
  WHERE User_ID = ?;
  `

  return executeQuery(sql,[userId])
}

//Get the status of a token, returns true if token is valid
const getTokenStatus = async (token) =>{

  const sql = `SELECT Valid FROM TOKENS WHERE Token = ?;`

  const result = await executeQuery(sql,[token]);
  const JSONres = result
  console.log(JSONres[0].Valid)
  if(result){
    return JSONres[0].Valid;
  }else{
    return 0;
  }
}
const addSubscription = async (jobId, businessId, endpoint, authKey1, authKey2) => {
    try{

        await(removeSubscription(jobId))

    }catch (err){

        return 0
    }
  const sql = `
    INSERT INTO SUBSCRIPTION_TABLE (Job_ID, Business_ID, Endpoint, Auth_Key1, Auth_Key2)
    VALUES (?,?,?,?,?);
  `;

  return executeQuery(sql, [jobId, businessId, endpoint, authKey1, authKey2]);
};

const removeSubscription = async (jobId) => {
  const sql = 'DELETE FROM SUBSCRIPTION_TABLE WHERE Job_ID = ?'
  return executeQuery(sql, [jobId]);

}


const testFunctions = async () => {
  try {
    /*
    const businessId = 1; 
    const userId = 5; 
    const jobId = 10; 


    const openAllJobs = await getOpenJobs(businessId);
    console.log('All open jobs for business:', openAllJobs);

    const openJobsForUser = await getOpenJobs(businessId, userId);
    console.log('Open jobs for user:', openJobsForUser);

    const jobHistoryForUser = await getJobHistory(businessId, userId);
    console.log('Job history for user:', jobHistoryForUser);

    const allJobHistory = await getJobHistory(businessId);
    console.log('All job history for business:', allJobHistory);

    const assignResult = await assignJobToUser(userId, jobId);
    console.log('Job assigned to user:', assignResult);

    const completeResult = await completeJob(userId, jobId, 'Completed successfully');
    console.log('Job completed:', completeResult);

    const notifications = await getNotifications(jobId);
    console.log('Notifications for job:', notifications);

    const subscription = await getSubscription(jobId, businessId);
    console.log('Subscription details:', subscription);

    const jobDetails = await getJobDetails(jobId);
    console.log('Job details:', jobDetails);
    */

    await completeJob(2,'13381d5135ea9bb2c91dfaf3cfcdc781')

    closeDB();
  } catch (err) {
    console.error('Error during testing:', err.message);
  }
};

//testFunctions();

export {
  addNotification,
  generateUniqueJobId,
  createNewJob,
  deletefromjobtable,
  deletefromjobhistorytable,
  getNotifications,
  getOpenJobs,
  getJobHistory,
  assignJobToUser,
  completeJob,
  getSubscription,
  addSubscription,
  getJobDetails,
  addToken,
  getTokenStatus,
  freezeUser,
  blockToken,
  removeSubscription
};
