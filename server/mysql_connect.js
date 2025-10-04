const mysql = require('mysql2');
const config = require('./config_sql.js');
const con = mysql.createConnection({
    host: config.host,
    user: config.uname,
    password: config.upass,
    database: config.database
});

module.exports = {
    connect,
    registercomplaint,
    createowner,
    bookslot,
    getdata,
    totalowner,
    totaltenant,
    totalemployee,
    totalcomplaint,
    createownerproof,
    viewcomplaints,
    authoriseuser,
    gettenantdata,
    createtenant,
    createtenantproof,
    ownerroomdetails,
    ownercomplaints,
    viewparking,
    createuserid,
    paymaintanence,
    empsalary,
    ownertenantdetails,
    createEmployee,
    // New functions
    createEvent,
    getEvents,
    createAmenity,
    getAmenities,
    createServiceProvider,
    getServiceProviders,
    getBlocks,
    addRoom
};

// Used to establish connection with the database
function connect() {
    con.connect(function(err) {
        if (err) throw err;
        console.log("Database Connected!");
    });
}




//register the complaint to the block 
function registercomplaint(values, callback) {
    const [complaint, reportedBy, blockNo, roomNo] = values;
    
    // First check if the room exists in the specified block
    const checkSql = 'SELECT * FROM room WHERE block_no = ? AND room_no = ?';
    con.query(checkSql, [blockNo, roomNo], (err, results) => {
        if (err) {
            console.log('Error checking room:', err);
            callback(err, null);
            return;
        }

        // If room doesn't exist in this block, we can't add a complaint
        if (results.length === 0) {
            callback(new Error(`No room found with number ${roomNo} in block ${blockNo}`), null);
            return;
        }

        // Insert new complaint
        const insertSql = `
            INSERT INTO complaints 
            (block_no, room_no, complaint_text, reported_by) 
            VALUES (?, ?, ?, ?)
        `;
        console.log('Creating new complaint:', [blockNo, roomNo, complaint, reportedBy]);
        con.query(insertSql, [blockNo, roomNo, complaint, reportedBy], (err, results) => {
            if (err) {
                console.log('Error creating complaint:', err);
                callback(err, null);
                return;
            }
            callback(null, results);
        });
    });
}

// view all complaints
function viewcomplaints(callback) {
    const sql = `
        SELECT 
            c.complaint_id,
            c.block_no,
            c.room_no,
            c.complaint_text as complaints,
            c.reported_by,
            c.status,
            c.reported_date,
            CONCAT('Block ', c.block_no, ' - Room ', c.room_no) as location,
            o.name as owner_name
        FROM complaints c
        LEFT JOIN room r ON c.room_no = r.room_no
        LEFT JOIN owner o ON r.room_no = o.room_no
        ORDER BY c.reported_date DESC
    `;
    
    console.log('Fetching all complaints');
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching complaints:', err);
            callback(err, null);
            return;
        }

        console.log(`Found ${results?.length || 0} total complaints`);
        if (results?.length > 0) {
            console.log('Sample complaint:', results[0]);
        }

        callback(null, results || []);
    });
}

// view owner complaints
function ownercomplaints(ownerid, callback) {
    const sql = `
        SELECT DISTINCT
            c.complaint_id,
            c.block_no,
            c.room_no,
            c.complaint_text as complaints,
            c.reported_by,
            c.status,
            c.reported_date,
            o.name as owner_name,
            o.owner_id,
            CONCAT('Block ', c.block_no, ' - Room ', c.room_no) as location
        FROM owner o
        INNER JOIN auth a ON o.owner_id = a.id
        INNER JOIN room r ON o.room_no = r.room_no
        LEFT JOIN complaints c ON r.room_no = c.room_no
        WHERE a.user_id = ?
        ORDER BY c.reported_date DESC
    `;

    console.log('Fetching owner complaints for:', ownerid);
    con.query(sql, [ownerid], (err, results) => {
        if (err) {
            console.error('Error fetching owner complaints:', err);
            callback(err, null);
            return;
        }

        console.log(`Found ${results?.length || 0} complaints for owner ${ownerid}`);
        if (results?.length > 0) {
            console.log('Sample complaint:', results[0]);
        }

        callback(null, results || []);
    });
}

//function to calculate total number of owners
function totalowner(callback)
{
    sql = 'SELECT COUNT(owner_id) FROM owner';
    con.query(sql,(err,results)=>
    {
        callback(err,results);
    })
}

//get all the data from the table using table name
function getdata(tablename,callback)
{
    sql = 'select * from '+tablename+';';
    con.query(sql,(err,results)=>
    {
        callback(err,results);
    })
}


//add an owner tuple to the table
function createowner(values,callback)
{
    sql = 'insert into owner values(?,?,?,?,?,?)';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}
//function to create an owner
function createownerproof(values,callback)
{
    sql = 'insert into identity values(?,?,null);';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}



//book a parking slot for the tenant
function bookslot(values, callback)
{
    // First check if room exists
    const checkRoomSql = 'SELECT * FROM room WHERE room_no = ?';
    con.query(checkRoomSql, [values[1]], (err, roomResults) => {
        if (err) {
            callback(err, null);
            return;
        }

        if (roomResults.length === 0) {
            callback(new Error(`Room number ${values[1]} does not exist`), null);
            return;
        }

        // Check if parking slot is already assigned to another room
        const checkParkingSql = 'SELECT room_no FROM room WHERE parking_slot = ? AND room_no != ?';
        con.query(checkParkingSql, [values[0], values[1]], (err, parkingResults) => {
            if (err) {
                callback(err, null);
                return;
            }

            if (parkingResults.length > 0) {
                callback(new Error(`Parking slot ${values[0]} is already assigned to room ${parkingResults[0].room_no}`), null);
                return;
            }

            // Update the parking slot
            const updateSql = 'UPDATE room SET parking_slot = ? WHERE room_no = ?';
            con.query(updateSql, values, (err, results) => {
                callback(err, results);
            });
        });
    });
}



// view all complaints
function viewcomplaints(callback) {
    const sql = `
        SELECT 
            c.complaint_id,
            c.block_no,
            c.room_no,
            c.complaint_text as complaints,
            c.reported_by,
            c.status,
            c.reported_date,
            CONCAT('Block ', c.block_no, ' - Room ', c.room_no) as location,
            o.name as owner_name
        FROM complaints c
        LEFT JOIN owner o ON c.room_no = o.room_no
        ORDER BY c.reported_date DESC
    `;
    
    console.log('Fetching all complaints');
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching complaints:', err);
            callback(err, null);
            return;
        }

        console.log(`Found ${results?.length || 0} total complaints`);
        if (results?.length > 0) {
            console.log('Sample complaint:', results[0]);
        }

        callback(null, results || []);
    });
}

// view owner complaints
function ownercomplaints(ownerid, callback) {
    const sql = `
        SELECT DISTINCT
            c.complaint_id,
            c.block_no,
            c.room_no,
            c.complaint_text as complaints,
            c.reported_by,
            c.status,
            c.reported_date,
            o.name as owner_name,
            o.owner_id,
            CONCAT('Block ', c.block_no, ' - Room ', c.room_no) as location
        FROM owner o
        INNER JOIN auth a ON o.owner_id = a.id
        LEFT JOIN complaints c ON o.room_no = c.room_no
        WHERE a.user_id = ?
        ORDER BY c.reported_date DESC
    `;

    console.log('Fetching owner complaints for:', ownerid);
    con.query(sql, [ownerid], (err, results) => {
        if (err) {
            console.error('Error fetching owner complaints:', err);
            callback(err, null);
            return;
        }

        console.log(`Found ${results?.length || 0} complaints for owner ${ownerid}`);
        if (results?.length > 0) {
            console.log('Sample complaint:', results[0]);
        }

        callback(null, results || []);
    });
}

//function to retrieve total number of complaints
function totalcomplaint(callback) {
    sql = 'SELECT COUNT(*) as count FROM complaints';
    con.query(sql, (err, results) => {
        callback(err, results);
    });
}
//get the total no of tenants
function totaltenant(callback)
{
    sql = 'SELECT COUNT(tenant_id) FROM tenant';
    con.query(sql,(err,results)=>
    {
        callback(err,results);
    })
}
//get the total number of employees
function totalemployee(callback)
{
    sql = 'SELECT COUNT(emp_id) FROM employee';
    con.query(sql,(err,results)=>
    {
        callback(err,results);
    })
}
//get the data of tenent
function gettenantdata(tid,callback)
{
    sql = 'select * from tenant where tenant_id in (select id from auth where user_id=?)';
    con.query(sql,tid,(err,results)=>
    {
        callback(err,results);
    })
}




//creating an tenant id
function createtenant(values,callback)
{
    sql = 'insert into tenant values(?,?,?,null,?,?)';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}
//creating an proof for tenant
function createtenantproof(values,callback)
{
    sql = 'insert into identity values(?,null,?)';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}
function createuserid(values,callback)
{
    sql = 'insert into auth values(?,?,?)';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}


//owner viewing tenant details
function ownertenantdetails(values,callback)
{
    sql = 'select * from tenant where room_no in (select room_no from owner where owner_id in(select id from auth where user_id=?))';
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}

//tenant pays maintanence fee
function paymaintanence(id,callback)
{
    sql = 'update tenant set stat="paid" where tenant_id in (select id from auth where user_id=?)';
    con.query(sql,id,(err,results)=>
    {
        callback(err,results);
    })
}

//owner viewing room owned by him
function ownerroomdetails(values,callback)
{
    sql = `
        SELECT r.*, 
            CASE 
                WHEN r.parking_slot IS NULL THEN 'No parking allocated'
                ELSE CONCAT('Slot: ', r.parking_slot)
            END as parking_details
        FROM room r 
        WHERE r.room_no IN (
            SELECT room_no 
            FROM owner 
            WHERE owner_id IN (
                SELECT id 
                FROM auth 
                WHERE user_id = ?
            )
        )`;
    con.query(sql,values,(err,results)=>
    {
        callback(err,results);
    })
}
//view parking alloted for tenant
function viewparking(id,callback)
{
    sql = `
        SELECT r.*,
            CASE 
                WHEN r.parking_slot IS NULL THEN 'No parking allocated'
                ELSE CONCAT('Slot: ', r.parking_slot)
            END as parking_details
        FROM room r 
        WHERE room_no IN (
            SELECT room_no 
            FROM tenant 
            WHERE tenant_id IN (
                SELECT id 
                FROM auth 
                WHERE user_id = ?
            )
        )`;
    con.query(sql,id,(err,results)=>
    {
        callback(err,results);
    })
}


//employee salary get 
function empsalary(id,callback)
{
    sql = 'select salary from employee where emp_id in (select id from auth where user_id=?)';
    con.query(sql,id,(err,results)=>
    {
        callback(err,results);
    })
}



//function to validate user with username and password
function authoriseuser(username,password,callback)
{
    let results;
    sql = 'SELECT password from auth where user_id = ?';
    const value = [username];
    console.log(value);
    con.query(sql,value,(err,result)=>
    {
        if(result.length===0)
        {
            results = "denied";
            callback(err,results);
            return;
        }
        else
        {
        const  resultArray = Object.values(JSON.parse(JSON.stringify(result))[0])[0];
        if(password === resultArray)
        {
            results = "granted";
        }
        else
        {
            results = "denied";
        }
        callback(err,results);
    }

    })
}


//create an employee
function createEmployee(values, callback) {
    sql = 'insert into employee values(?,?,?,?,?,?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    });
}

// Community Events functions
function createEvent(values, callback) {
    sql = 'INSERT INTO community_events VALUES (?, ?, ?, ?, ?, ?, ?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    });
}

function getEvents(callback) {
    sql = 'SELECT * FROM community_events ORDER BY event_date DESC';
    con.query(sql, (err, results) => {
        callback(err, results);
    });
}

// Amenities functions
function createAmenity(values, callback) {
    sql = 'INSERT INTO amenities VALUES (?, ?, ?, ?, ?, ?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    });
}

function getAmenities(callback) {
    sql = 'SELECT * FROM amenities ORDER BY amenity_name';
    con.query(sql, (err, results) => {
        callback(err, results);
    });
}

// Service Providers functions
function createServiceProvider(values, callback) {
    sql = 'INSERT INTO service_providers VALUES (?, ?, ?, ?, ?, ?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    });
}

function getServiceProviders(callback) {
    sql = 'SELECT * FROM service_providers ORDER BY service_type, provider_name';
    con.query(sql, (err, results) => {
        callback(err, results);
    });
}

// Get all blocks
function getBlocks(callback) {
    const sql = 'SELECT * FROM block ORDER BY block_no';
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching blocks:', err);
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

// Add new room to a block
function addRoom(values, callback) {
    const [roomNo, type, floor, parkingSlot, regNo, blockNo] = values;
    
    // First check if room number already exists
    const checkSql = 'SELECT * FROM room WHERE room_no = ?';
    con.query(checkSql, [roomNo], (err, results) => {
        if (err) {
            console.error('Error checking room:', err);
            callback(err, null);
            return;
        }

        if (results.length > 0) {
            callback(new Error('Room number already exists'), null);
            return;
        }

        // Check if registration number already exists
        const checkRegSql = 'SELECT * FROM room WHERE reg_no = ?';
        con.query(checkRegSql, [regNo], (err, results) => {
            if (err) {
                console.error('Error checking registration number:', err);
                callback(err, null);
                return;
            }

            if (results.length > 0) {
                callback(new Error('Registration number already exists'), null);
                return;
            }

            // Check if parking slot is already assigned (if provided)
            if (parkingSlot) {
                const checkParkingSql = 'SELECT * FROM room WHERE parking_slot = ?';
                con.query(checkParkingSql, [parkingSlot], (err, results) => {
                    if (err) {
                        console.error('Error checking parking slot:', err);
                        callback(err, null);
                        return;
                    }

                    if (results.length > 0) {
                        callback(new Error('Parking slot already assigned'), null);
                        return;
                    }
                    checkBlockAndCreateRoom();
                });
            } else {
                checkBlockAndCreateRoom();
            }
        });
    });

    function checkBlockAndCreateRoom() {
        // Check if block exists
        const checkBlockSql = 'SELECT * FROM block WHERE block_no = ?';
        con.query(checkBlockSql, [blockNo], (err, results) => {
            if (err) {
                console.error('Error checking block:', err);
                callback(err, null);
                return;
            }

            if (results.length === 0) {
                callback(new Error('Block does not exist'), null);
                return;
            }

            // All checks passed, insert the new room and update block
            const insertRoomSql = `
                INSERT INTO room (room_no, type, floor, parking_slot, reg_no, block_no) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            con.query(insertRoomSql, [roomNo, type, floor, parkingSlot, regNo, blockNo], (err, result) => {
                if (err) {
                    console.error('Error creating room:', err);
                    callback(err, null);
                    return;
                }

                // Update block with room_no
                const updateBlockSql = `
                    UPDATE block 
                    SET room_no = ? 
                    WHERE block_no = ?
                `;
                con.query(updateBlockSql, [roomNo, blockNo], (err, blockResult) => {
                    if (err) {
                        console.error('Error updating block:', err);
                        callback(err, null);
                        return;
                    }
                    callback(null, result);
                });
            });
        });
    }
}