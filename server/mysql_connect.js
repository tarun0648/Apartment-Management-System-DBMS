const mysql = require('mysql2');
const config = require('./config_sql.js');

const con = mysql.createConnection({
    host: config.host,
    user: config.uname,
    password: config.upass,
    database: config.database
});

// ============= CONNECTION =============
function connect() {
    con.connect(function(err) {
        if (err) throw err;
        console.log("Database Connected!");
    });
}

// ============= AUTHENTICATION =============
function authoriseuser(username, password, callback) {
    let results;
    const sql = 'SELECT password from auth where user_id = ?';
    const value = [username];
    console.log(value);
    con.query(sql, value, (err, result) => {
        if (err) {
            console.log('Database error:', err);
            callback(err, "denied");
            return;
        }
        
        console.log('Query result:', result);
        
        if (!result || result.length === 0) {
            console.log('User not found');
            results = "denied";
            callback(null, results);
            return;
        } else {
            const resultArray = Object.values(JSON.parse(JSON.stringify(result))[0])[0];
            console.log('Password from DB:', resultArray);
            console.log('Password provided:', password);
            
            if (password === resultArray) {
                results = "granted";
                console.log('Password matched - granted');
            } else {
                results = "denied";
                console.log('Password mismatch - denied');
            }
            callback(null, results);
        }
    })
}

function createuserid(values, callback) {
    const sql = 'insert into auth values(?,?,?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    })
}

// ============= COMPLAINTS =============
function registercomplaint(values, callback) {
    const [complaint, reportedBy, blockNo, roomNo] = values;
    
    const checkSql = 'SELECT * FROM room WHERE block_no = ? AND room_no = ?';
    con.query(checkSql, [blockNo, roomNo], (err, results) => {
        if (err) {
            console.log('Error checking room:', err);
            callback(err, null);
            return;
        }

        if (results.length === 0) {
            callback(new Error(`No room found with number ${roomNo} in block ${blockNo}`), null);
            return;
        }

        const insertSql = `INSERT INTO complaints (block_no, room_no, complaint_text, reported_by) VALUES (?, ?, ?, ?)`;
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
    
    con.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching complaints:', err);
            callback(err, null);
            return;
        }
        callback(null, results || []);
    });
}

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

    con.query(sql, [ownerid], (err, results) => {
        if (err) {
            console.error('Error fetching owner complaints:', err);
            callback(err, null);
            return;
        }
        callback(null, results || []);
    });
}

function totalcomplaint(callback) {
    const sql = 'SELECT COUNT(*) as count FROM complaints';
    con.query(sql, (err, results) => {
        callback(err, results);
    });
}

function updateComplaintStatus(complaintId, status, callback) {
    const sql = "UPDATE complaints SET status = ? WHERE complaint_id = ?";
    con.query(sql, [status, complaintId], callback);
}

function deleteComplaint(complaintId, callback) {
    const sql = "DELETE FROM complaints WHERE complaint_id = ?";
    con.query(sql, [complaintId], callback);
}

// ============= OWNER FUNCTIONS =============
function createowner(values, callback) {
    const sql = 'insert into owner values(?,?,?,?,?,?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    })
}

function createownerproof(values, callback) {
    const sql = 'insert into identity values(?,?,null)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    })
}

function totalowner(callback) {
    const sql = 'SELECT COUNT(owner_id) FROM owner';
    con.query(sql, (err, results) => {
        callback(err, results);
    })
}

function ownerroomdetails(values, callback) {
    const sql = `
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
    con.query(sql, values, (err, results) => {
        callback(err, results);
    })
}

function ownertenantdetails(values, callback) {
    const sql = 'select * from tenant where room_no in (select room_no from owner where owner_id in(select id from auth where user_id=?))';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    })
}

function updateOwner(ownerId, values, callback) {
    const sql = "UPDATE owner SET name = ?, age = ?, aggrement_status = ?, room_no = ?, dob = ? WHERE owner_id = ?";
    con.query(sql, [...values, ownerId], callback);
}

function deleteOwner(ownerId, callback) {
    const sql = "DELETE FROM owner WHERE owner_id = ?";
    con.query(sql, [ownerId], callback);
}

// ============= TENANT FUNCTIONS =============
function createtenant(values, callback) {
    const sql = 'insert into tenant values(?,?,?,null,?,?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    })
}

function createtenantproof(values, callback) {
    const sql = 'insert into identity values(?,null,?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    })
}

function totaltenant(callback) {
    const sql = 'SELECT COUNT(tenant_id) FROM tenant';
    con.query(sql, (err, results) => {
        callback(err, results);
    })
}

function gettenantdata(tid, callback) {
    const sql = 'select * from tenant where tenant_id in (select id from auth where user_id=?)';
    con.query(sql, tid, (err, results) => {
        callback(err, results);
    })
}

function paymaintanence(id, callback) {
    const sql = 'update tenant set stat="paid" where tenant_id in (select id from auth where user_id=?)';
    con.query(sql, id, (err, results) => {
        callback(err, results);
    })
}

function updateTenant(tenantId, values, callback) {
    const sql = "UPDATE tenant SET name = ?, dob = ?, stat = ?, room_no = ?, age = ? WHERE tenant_id = ?";
    con.query(sql, [...values, tenantId], callback);
}

function deleteTenant(tenantId, callback) {
    const sql = "DELETE FROM tenant WHERE tenant_id = ?";
    con.query(sql, [tenantId], callback);
}

// ============= EMPLOYEE FUNCTIONS =============
function createEmployee(values, callback) {
    const sql = 'insert into employee values(?,?,?,?,?,?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    });
}

function totalemployee(callback) {
    const sql = 'SELECT COUNT(emp_id) FROM employee';
    con.query(sql, (err, results) => {
        callback(err, results);
    })
}

function empsalary(id, callback) {
    const sql = 'select salary from employee where emp_id in (select id from auth where user_id=?)';
    con.query(sql, id, (err, results) => {
        callback(err, results);
    })
}

function updateEmployee(empId, values, callback) {
    const sql = "UPDATE employee SET emp_name = ?, salary = ?, emp_type = ?, age = ?, block_no = ? WHERE emp_id = ?";
    con.query(sql, [...values, empId], callback);
}

function deleteEmployee(empId, callback) {
    const sql = "DELETE FROM employee WHERE emp_id = ?";
    con.query(sql, [empId], callback);
}

// ============= PARKING & ROOM FUNCTIONS =============
function bookslot(values, callback) {
    const checkRoomSql = 'SELECT * FROM room WHERE room_no = ?';
    con.query(checkRoomSql, [values[2]], (err, roomResults) => {
        if (err) {
            callback(err, null);
            return;
        }

        if (roomResults.length === 0) {
            callback(new Error(`Room number ${values[2]} does not exist`), null);
            return;
        }

        const checkParkingSql = 'SELECT room_no FROM room WHERE parking_slot = ? AND room_no != ?';
        con.query(checkParkingSql, [values[0], values[2]], (err, parkingResults) => {
            if (err) {
                callback(err, null);
                return;
            }

            if (parkingResults.length > 0) {
                callback(new Error(`Parking slot ${values[0]} is already assigned to room ${parkingResults[0].room_no}`), null);
                return;
            }

            const updateSql = 'UPDATE room SET parking_slot = ?, reg_no = ? WHERE room_no = ?';
            con.query(updateSql, values, (err, results) => {
                callback(err, results);
            });
        });
    });
}

function viewparking(id, callback) {
    const sql = `
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
    con.query(sql, id, (err, results) => {
        callback(err, results);
    })
}

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

function addRoom(values, callback) {
    const [roomNo, type, floor, parkingSlot, regNo, blockNo] = values;
    
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

        const insertSql = 'INSERT INTO room (room_no, type, floor, parking_slot, reg_no, block_no) VALUES (?, ?, ?, ?, ?, ?)';
        con.query(insertSql, values, (err, results) => {
            callback(err, results);
        });
    });
}

// ============= GENERAL FUNCTIONS =============
function getdata(tablename, callback) {
    const sql = 'select * from ' + tablename + ';';
    con.query(sql, (err, results) => {
        callback(err, results);
    })
}

// ============= COMMUNITY EVENTS =============
function createEvent(values, callback) {
    const sql = 'INSERT INTO community_events VALUES (?, ?, ?, ?, ?, ?, ?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    });
}

function getEvents(callback) {
    const sql = 'SELECT * FROM community_events ORDER BY event_date DESC';
    con.query(sql, (err, results) => {
        callback(err, results);
    });
}

function updateEvent(eventId, values, callback) {
    const sql = "UPDATE community_events SET apartment_id = ?, location = ?, description = ?, organizer_id = ?, event_name = ?, event_date = ? WHERE event_id = ?";
    con.query(sql, [...values, eventId], callback);
}

function deleteEvent(eventId, callback) {
    const sql = "DELETE FROM community_events WHERE event_id = ?";
    con.query(sql, [eventId], callback);
}

// ============= AMENITIES =============
function createAmenity(values, callback) {
    const sql = 'INSERT INTO amenities VALUES (?, ?, ?, ?, ?, ?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    });
}

function getAmenities(callback) {
    const sql = 'SELECT * FROM amenities ORDER BY amenity_name';
    con.query(sql, (err, results) => {
        callback(err, results);
    });
}

function updateAmenity(amenityId, values, callback) {
    const sql = "UPDATE amenities SET amenity_name = ?, description = ?, phone_number = ?, email = ?, rating = ? WHERE amenity_id = ?";
    con.query(sql, [...values, amenityId], callback);
}

function deleteAmenity(amenityId, callback) {
    const sql = "DELETE FROM amenities WHERE amenity_id = ?";
    con.query(sql, [amenityId], callback);
}

// ============= SERVICE PROVIDERS =============
function createServiceProvider(values, callback) {
    const sql = 'INSERT INTO service_providers VALUES (?, ?, ?, ?, ?, ?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    });
}

function getServiceProviders(callback) {
    const sql = 'SELECT * FROM service_providers ORDER BY service_type, provider_name';
    con.query(sql, (err, results) => {
        callback(err, results);
    });
}

function updateServiceProvider(providerId, values, callback) {
    const sql = "UPDATE service_providers SET provider_name = ?, service_type = ?, contact_number = ?, email = ?, rating = ? WHERE provider_id = ?";
    con.query(sql, [...values, providerId], callback);
}

function deleteServiceProvider(providerId, callback) {
    const sql = "DELETE FROM service_providers WHERE provider_id = ?";
    con.query(sql, [providerId], callback);
}

// ============= MAINTENANCE FUNCTIONS =============
function createMaintenance(values, callback) {
    const sql = "INSERT INTO maintenance (month, amount, status, apartment_id, due_date) VALUES (?, ?, ?, ?, ?)";
    con.query(sql, values, callback);
}

function getAllMaintenance(callback) {
    const sql = `SELECT m.*, r.type as room_type, r.floor, 
                 o.name as owner_name, t.name as tenant_name
                 FROM maintenance m
                 LEFT JOIN room r ON m.apartment_id = r.room_no
                 LEFT JOIN owner o ON r.room_no = o.room_no
                 LEFT JOIN tenant t ON r.room_no = t.room_no
                 ORDER BY m.created_at DESC`;
    con.query(sql, callback);
}

function getMaintenanceByApartment(apartmentId, callback) {
    const sql = `SELECT m.*, r.type as room_type, r.floor
                 FROM maintenance m
                 LEFT JOIN room r ON m.apartment_id = r.room_no
                 WHERE m.apartment_id = ?
                 ORDER BY m.created_at DESC`;
    con.query(sql, [apartmentId], callback);
}

function updateMaintenance(maintenanceId, values, callback) {
    const sql = "UPDATE maintenance SET month = ?, amount = ?, status = ?, apartment_id = ?, due_date = ? WHERE maintenance_id = ?";
    con.query(sql, [...values, maintenanceId], callback);
}

function deleteMaintenance(maintenanceId, callback) {
    const sql = "DELETE FROM maintenance WHERE maintenance_id = ?";
    con.query(sql, [maintenanceId], callback);
}

function payMaintenance(maintenanceId, callback) {
    const sql = "UPDATE maintenance SET status = 'Paid' WHERE maintenance_id = ?";
    con.query(sql, [maintenanceId], callback);
}

// ============= FEEDBACK FUNCTIONS =============
function createFeedback(values, callback) {
    const sql = "INSERT INTO feedback (user_id, user_type, feedback_text, rating) VALUES (?, ?, ?, ?)";
    con.query(sql, values, callback);
}

function getAllFeedback(callback) {
    const sql = `SELECT f.*, 
                 CASE 
                   WHEN f.user_type = 'owner' THEN o.name
                   WHEN f.user_type = 'tenant' THEN t.name
                 END as user_name,
                 CASE 
                   WHEN f.user_type = 'owner' THEN o.room_no
                   WHEN f.user_type = 'tenant' THEN t.room_no
                 END as room_no
                 FROM feedback f
                 LEFT JOIN owner o ON f.user_id = o.owner_id AND f.user_type = 'owner'
                 LEFT JOIN tenant t ON f.user_id = t.tenant_id AND f.user_type = 'tenant'
                 ORDER BY f.feedback_date DESC`;
    con.query(sql, callback);
}

function getFeedbackByUser(userId, userType, callback) {
    const sql = "SELECT * FROM feedback WHERE user_id = ? AND user_type = ? ORDER BY feedback_date DESC";
    con.query(sql, [userId, userType], callback);
}

function updateFeedback(feedbackId, values, callback) {
    const sql = "UPDATE feedback SET feedback_text = ?, rating = ? WHERE feedback_id = ?";
    con.query(sql, [...values, feedbackId], callback);
}

function deleteFeedback(feedbackId, callback) {
    const sql = "DELETE FROM feedback WHERE feedback_id = ?";
    con.query(sql, [feedbackId], callback);
}

function updateFeedbackStatus(feedbackId, status, callback) {
    const sql = "UPDATE feedback SET status = ? WHERE feedback_id = ?";
    con.query(sql, [status, feedbackId], callback);
}

// ============= EXPORTS =============
module.exports = {
    connect,
    authoriseuser,
    createuserid,
    registercomplaint,
    viewcomplaints,
    viewcomplaint: viewcomplaints,
    ownercomplaints,
    totalcomplaint,
    updateComplaintStatus,
    deleteComplaint,
    createowner,
    createownerproof,
    totalowner,
    ownerroomdetails,
    ownertenantdetails,
    updateOwner,
    deleteOwner,
    createtenant,
    createtenantproof,
    totaltenant,
    gettenantdata,
    paymaintanence,
    updateTenant,
    deleteTenant,
    createEmployee,
    totalemployee,
    empsalary,
    updateEmployee,
    deleteEmployee,
    bookslot,
    viewparking,
    getBlocks,
    addRoom,
    getdata,
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent,
    createAmenity,
    getAmenities,
    updateAmenity,
    deleteAmenity,
    createServiceProvider,
    getServiceProviders,
    updateServiceProvider,
    deleteServiceProvider,
    createMaintenance,
    getAllMaintenance,
    getMaintenanceByApartment,
    updateMaintenance,
    deleteMaintenance,
    payMaintenance,
    createFeedback,
    getAllFeedback,
    getFeedbackByUser,
    updateFeedback,
    deleteFeedback,
    updateFeedbackStatus
};