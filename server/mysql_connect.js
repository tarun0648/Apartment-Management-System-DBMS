const mysql = require('mysql2');
const config = require('./config_sql.js');

const con = mysql.createConnection({
    host: config.host,
    user: config.uname,
    password: config.upass,
    database: config.database,
    multipleStatements: true  // Enable multiple statements for procedures
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
    // Check if room exists and is not already occupied
    const roomNo = values[4]; // room_no is at index 4
    
    const checkRoomSql = 'SELECT * FROM room WHERE room_no = ?';
    con.query(checkRoomSql, [roomNo], (err, roomResults) => {
        if (err) {
            callback(err, null);
            return;
        }

        if (roomResults.length === 0) {
            callback(new Error(`Room number ${roomNo} does not exist`), null);
            return;
        }

        // Check if room already has an owner
        const checkOwnerSql = 'SELECT * FROM owner WHERE room_no = ?';
        con.query(checkOwnerSql, [roomNo], (err, ownerResults) => {
            if (err) {
                callback(err, null);
                return;
            }

            if (ownerResults.length > 0) {
                callback(new Error(`Room ${roomNo} already has an owner`), null);
                return;
            }

            // Insert owner (trigger will auto-create auth entry)
            const sql = 'INSERT INTO owner VALUES(?,?,?,?,?,?)';
            con.query(sql, values, (err, results) => {
                callback(err, results);
            });
        });
    });
}

function createownerproof(values, callback) {
    const sql = 'INSERT INTO identity VALUES(?,?,null)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    })
}

function totalowner(callback) {
    const sql = 'SELECT COUNT(owner_id) as count FROM owner';
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
    const sql = 'SELECT * FROM tenant WHERE room_no IN (SELECT room_no FROM owner WHERE owner_id IN(SELECT id FROM auth WHERE user_id=?))';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    })
}

function updateOwner(ownerId, values, callback) {
    const sql = "UPDATE owner SET name = ?, age = ?, aggrement_status = ?, room_no = ?, dob = ? WHERE owner_id = ?";
    con.query(sql, [...values, ownerId], callback);
}

function deleteOwner(ownerId, callback) {
    // First delete from auth table
    const deleteAuthSql = "DELETE FROM auth WHERE user_id = ?";
    con.query(deleteAuthSql, [`o-${ownerId}`], (err) => {
        if (err) {
            callback(err, null);
            return;
        }
        
        // Then delete from owner table
        const sql = "DELETE FROM owner WHERE owner_id = ?";
        con.query(sql, [ownerId], callback);
    });
}

// ============= TENANT FUNCTIONS =============
function createtenant(values, callback) {
    // Check if room exists
    const roomNo = values[4]; // room_no is at index 4
    
    const checkRoomSql = 'SELECT * FROM room WHERE room_no = ?';
    con.query(checkRoomSql, [roomNo], (err, roomResults) => {
        if (err) {
            callback(err, null);
            return;
        }

        if (roomResults.length === 0) {
            callback(new Error(`Room number ${roomNo} does not exist`), null);
            return;
        }

        // Insert tenant (trigger will auto-create auth entry)
        const sql = 'INSERT INTO tenant VALUES(?,?,?,null,?,?)';
        con.query(sql, values, (err, results) => {
            callback(err, results);
        });
    });
}

function createtenantproof(values, callback) {
    const sql = 'INSERT INTO identity VALUES(?,null,?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    })
}

function totaltenant(callback) {
    const sql = 'SELECT COUNT(tenant_id) as count FROM tenant';
    con.query(sql, (err, results) => {
        callback(err, results);
    })
}

function gettenantdata(tid, callback) {
    const sql = 'SELECT * FROM tenant WHERE tenant_id IN (SELECT id FROM auth WHERE user_id=?)';
    con.query(sql, tid, (err, results) => {
        callback(err, results);
    })
}

function paymaintanence(id, callback) {
    const sql = 'UPDATE tenant SET stat="paid" WHERE tenant_id IN (SELECT id FROM auth WHERE user_id=?)';
    con.query(sql, id, (err, results) => {
        callback(err, results);
    })
}

function updateTenant(tenantId, values, callback) {
    const sql = "UPDATE tenant SET name = ?, dob = ?, stat = ?, room_no = ?, age = ? WHERE tenant_id = ?";
    con.query(sql, [...values, tenantId], callback);
}

function deleteTenant(tenantId, callback) {
    // First delete from auth table
    const deleteAuthSql = "DELETE FROM auth WHERE user_id = ?";
    con.query(deleteAuthSql, [`t-${tenantId}`], (err) => {
        if (err) {
            callback(err, null);
            return;
        }
        
        // Then delete from tenant table
        const sql = "DELETE FROM tenant WHERE tenant_id = ?";
        con.query(sql, [tenantId], callback);
    });
}

// ============= EMPLOYEE FUNCTIONS =============
function createEmployee(values, callback) {
    // Check if block exists
    const blockNo = values[5]; // block_no is at index 5
    
    const checkBlockSql = 'SELECT * FROM block WHERE block_no = ?';
    con.query(checkBlockSql, [blockNo], (err, blockResults) => {
        if (err) {
            callback(err, null);
            return;
        }

        if (blockResults.length === 0) {
            callback(new Error(`Block number ${blockNo} does not exist`), null);
            return;
        }

        // Insert employee (trigger will auto-create auth entry)
        const sql = 'INSERT INTO employee VALUES(?,?,?,?,?,?)';
        con.query(sql, values, (err, results) => {
            callback(err, results);
        });
    });
}

function totalemployee(callback) {
    const sql = 'SELECT COUNT(emp_id) as count FROM employee';
    con.query(sql, (err, results) => {
        callback(err, results);
    })
}

function empsalary(id, callback) {
    const sql = 'SELECT salary FROM employee WHERE emp_id IN (SELECT id FROM auth WHERE user_id=?)';
    con.query(sql, id, (err, results) => {
        callback(err, results);
    })
}

function updateEmployee(empId, values, callback) {
    const sql = "UPDATE employee SET emp_name = ?, salary = ?, emp_type = ?, age = ?, block_no = ? WHERE emp_id = ?";
    con.query(sql, [...values, empId], callback);
}

function deleteEmployee(empId, callback) {
    // First delete from auth table
    const deleteAuthSql = "DELETE FROM auth WHERE user_id = ?";
    con.query(deleteAuthSql, [`e-${empId}`], (err) => {
        if (err) {
            callback(err, null);
            return;
        }
        
        // Then delete from employee table
        const sql = "DELETE FROM employee WHERE emp_id = ?";
        con.query(sql, [empId], callback);
    });
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
    
    // Check if block exists
    const checkBlockSql = 'SELECT * FROM block WHERE block_no = ?';
    con.query(checkBlockSql, [blockNo], (err, blockResults) => {
        if (err) {
            console.error('Error checking block:', err);
            callback(err, null);
            return;
        }

        if (blockResults.length === 0) {
            callback(new Error(`Block number ${blockNo} does not exist`), null);
            return;
        }

        // Check if room already exists
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

            // Validate room type
            const validTypes = ['1BHK', '2BHK', '3BHK'];
            if (!validTypes.includes(type)) {
                callback(new Error('Invalid room type. Must be 1BHK, 2BHK, or 3BHK'), null);
                return;
            }

            const insertSql = 'INSERT INTO room (room_no, type, floor, parking_slot, reg_no, block_no) VALUES (?, ?, ?, ?, ?, ?)';
            con.query(insertSql, values, (err, results) => {
                callback(err, results);
            });
        });
    });
}

function deleteRoom(roomNo, callback) {
    // The before_room_delete trigger will prevent deletion if there are active occupants
    const sql = "DELETE FROM room WHERE room_no = ?";
    con.query(sql, [roomNo], callback);
}

// ============= GENERAL FUNCTIONS =============
function getdata(tablename, callback) {
    const sql = 'SELECT * FROM ' + tablename + ';';
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
    // Validate rating (0-5)
    const rating = values[5];
    if (rating < 0 || rating > 5) {
        callback(new Error('Rating must be between 0 and 5'), null);
        return;
    }
    
    const sql = 'INSERT INTO amenities VALUES (?, ?, ?, ?, ?, ?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    });
}

function getAmenities(callback) {
    const sql = 'SELECT * FROM amenities ORDER BY rating DESC, amenity_name';
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
    // Validate rating (0-5)
    const rating = values[5];
    if (rating < 0 || rating > 5) {
        callback(new Error('Rating must be between 0 and 5'), null);
        return;
    }
    
    const sql = 'INSERT INTO service_providers VALUES (?, ?, ?, ?, ?, ?)';
    con.query(sql, values, (err, results) => {
        callback(err, results);
    });
}

function getServiceProviders(callback) {
    const sql = 'SELECT * FROM service_providers ORDER BY rating DESC, service_type, provider_name';
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
    const [month, amount, status, apartmentId, dueDate] = values;
    
    // Check if room exists
    const checkRoomSql = 'SELECT * FROM room WHERE room_no = ?';
    con.query(checkRoomSql, [apartmentId], (err, roomResults) => {
        if (err) {
            callback(err, null);
            return;
        }

        if (roomResults.length === 0) {
            callback(new Error(`Room number ${apartmentId} does not exist`), null);
            return;
        }

        // Check if maintenance already exists for this month and apartment
        const checkMaintenanceSql = 'SELECT * FROM maintenance WHERE month = ? AND apartment_id = ?';
        con.query(checkMaintenanceSql, [month, apartmentId], (err, maintenanceResults) => {
            if (err) {
                callback(err, null);
                return;
            }

            if (maintenanceResults.length > 0) {
                callback(new Error(`Maintenance bill for ${month} already exists for room ${apartmentId}`), null);
                return;
            }

            const sql = "INSERT INTO maintenance (month, amount, status, apartment_id, due_date) VALUES (?, ?, ?, ?, ?)";
            con.query(sql, values, callback);
        });
    });
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
    // The after_maintenance_payment trigger will log this payment
    const sql = "UPDATE maintenance SET status = 'Paid' WHERE maintenance_id = ?";
    con.query(sql, [maintenanceId], callback);
}

// ============= FEEDBACK FUNCTIONS =============
function createFeedback(values, callback) {
    const [userId, userType, feedbackText, rating] = values;
    
    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
        callback(new Error('Rating must be between 1 and 5'), null);
        return;
    }
    
    // Validate user type
    if (!['owner', 'tenant'].includes(userType)) {
        callback(new Error('User type must be either "owner" or "tenant"'), null);
        return;
    }
    
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
    const validStatuses = ['New', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
        callback(new Error('Invalid status. Must be New, In Progress, or Resolved'), null);
        return;
    }
    
    const sql = "UPDATE feedback SET status = ? WHERE feedback_id = ?";
    con.query(sql, [status, feedbackId], callback);
}

// ============= STORED PROCEDURE FUNCTIONS =============

function getUserCompleteProfile(userId, callback) {
    const sql = 'CALL GetUserCompleteProfile(?)';
    con.query(sql, [userId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        // Stored procedures return an array of result sets
        callback(null, results[0]);
    });
}

function getMaintenanceSummary(month, callback) {
    const sql = 'CALL GetMaintenanceSummary(?)';
    con.query(sql, [month], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

function getBlockStatistics(blockNo, callback) {
    const sql = 'CALL GetBlockStatistics(?)';
    con.query(sql, [blockNo], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

function generateMonthlyMaintenance(month, baseAmount, dueDay, callback) {
    // Validate inputs
    if (!month || baseAmount <= 0 || dueDay < 1 || dueDay > 31) {
        callback(new Error('Invalid parameters for maintenance generation'), null);
        return;
    }
    
    const sql = 'CALL GenerateMonthlyMaintenance(?, ?, ?)';
    con.query(sql, [month, baseAmount, dueDay], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

function getTopRatedServices(callback) {
    const sql = 'CALL GetTopRatedServices()';
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        // Returns multiple result sets (amenities and service providers)
        callback(null, {
            amenities: results[0],
            serviceProviders: results[1]
        });
    });
}

// ============= USER-DEFINED FUNCTION INVOCATIONS =============

function getUserPendingMaintenance(userId, callback) {
    const sql = 'SELECT GetUserPendingMaintenance(?) as pending_amount';
    con.query(sql, [userId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

function getUserComplaintCount(userId, callback) {
    const sql = 'SELECT GetUserComplaintCount(?) as complaint_count';
    con.query(sql, [userId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

function getBlockOccupancyRate(blockNo, callback) {
    const sql = 'SELECT GetBlockOccupancyRate(?) as occupancy_rate';
    con.query(sql, [blockNo], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

// ============= COMPLEX VIEW QUERIES =============

function getRoomCompleteDetails(callback) {
    const sql = 'SELECT * FROM room_complete_details ORDER BY room_no';
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function getMaintenanceDashboard(callback) {
    const sql = 'SELECT * FROM maintenance_dashboard ORDER BY month DESC';
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function getUserActivitySummary(callback) {
    const sql = 'SELECT * FROM user_activity_summary ORDER BY user_type, user_id';
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

// ============= ADVANCED AGGREGATE QUERIES =============

function getComplaintStatistics(callback) {
    const sql = `
        SELECT 
            b.block_no,
            b.block_name,
            COUNT(c.complaint_id) as total_complaints,
            SUM(CASE WHEN c.status = 'Pending' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN c.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_count,
            SUM(CASE WHEN c.status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count,
            ROUND(AVG(CASE WHEN c.status = 'Resolved' THEN 
                TIMESTAMPDIFF(DAY, c.reported_date, c.reported_date) ELSE NULL END), 2) as avg_resolution_days
        FROM block b
        LEFT JOIN complaints c ON b.block_no = c.block_no
        GROUP BY b.block_no, b.block_name
        ORDER BY total_complaints DESC
    `;
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function getMaintenanceCollectionReport(callback) {
    const sql = `
        SELECT 
            DATE_FORMAT(m.created_at, '%Y-%m') as month_year,
            COUNT(*) as total_bills,
            SUM(m.amount) as total_billed,
            SUM(CASE WHEN m.status = 'Paid' THEN m.amount ELSE 0 END) as total_collected,
            SUM(CASE WHEN m.status = 'Unpaid' THEN m.amount ELSE 0 END) as total_pending,
            ROUND((SUM(CASE WHEN m.status = 'Paid' THEN m.amount ELSE 0 END) / NULLIF(SUM(m.amount), 0)) * 100, 2) as collection_rate,
            AVG(m.amount) as avg_bill_amount,
            MIN(m.amount) as min_bill,
            MAX(m.amount) as max_bill
        FROM maintenance m
        GROUP BY month_year
        ORDER BY month_year DESC
    `;
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function getFeedbackStatistics(callback) {
    const sql = `
        SELECT 
            f.user_type,
            COUNT(*) as total_feedbacks,
            AVG(f.rating) as avg_rating,
            MIN(f.rating) as min_rating,
            MAX(f.rating) as max_rating,
            SUM(CASE WHEN f.status = 'New' THEN 1 ELSE 0 END) as new_count,
            SUM(CASE WHEN f.status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_count,
            SUM(CASE WHEN f.status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count,
            SUM(CASE WHEN f.rating >= 4 THEN 1 ELSE 0 END) as positive_count,
            SUM(CASE WHEN f.rating <= 2 THEN 1 ELSE 0 END) as negative_count
        FROM feedback f
        GROUP BY f.user_type
    `;
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function getRoomOccupancyByBlock(callback) {
    const sql = `
        SELECT 
            b.block_no,
            b.block_name,
            COUNT(DISTINCT r.room_no) as total_rooms,
            COUNT(DISTINCT o.owner_id) as rooms_with_owners,
            COUNT(DISTINCT t.tenant_id) as rooms_with_tenants,
            ROUND((COUNT(DISTINCT CASE WHEN o.owner_id IS NOT NULL OR t.tenant_id IS NOT NULL THEN r.room_no END) / 
                   NULLIF(COUNT(DISTINCT r.room_no), 0)) * 100, 2) as occupancy_rate,
            COUNT(DISTINCT r.parking_slot) as allocated_parking
        FROM block b
        INNER JOIN room r ON b.block_no = r.block_no
        LEFT JOIN owner o ON r.room_no = o.room_no
        LEFT JOIN tenant t ON r.room_no = t.room_no
        GROUP BY b.block_no, b.block_name
        ORDER BY occupancy_rate DESC
    `;
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function getAverageMaintenanceByRoomType(callback) {
    const sql = `
        SELECT 
            r.type as room_type,
            COUNT(DISTINCT m.maintenance_id) as total_bills,
            AVG(m.amount) as avg_amount,
            MIN(m.amount) as min_amount,
            MAX(m.amount) as max_amount,
            SUM(m.amount) as total_amount,
            SUM(CASE WHEN m.status = 'Paid' THEN 1 ELSE 0 END) as paid_count,
            SUM(CASE WHEN m.status = 'Unpaid' THEN 1 ELSE 0 END) as unpaid_count,
            ROUND((SUM(CASE WHEN m.status = 'Paid' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0)) * 100, 2) as payment_rate
        FROM room r
        INNER JOIN maintenance m ON r.room_no = m.apartment_id
        GROUP BY r.type
        ORDER BY avg_amount DESC
    `;
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

// ============= COMPLEX NESTED QUERIES =============

function getUserDashboardData(userId, callback) {
    const userType = userId.substring(0, 1);
    const numericId = userId.substring(2);
    
    let sql = '';
    
    if (userType === 'o') {
        sql = `
            SELECT 
                o.owner_id,
                o.name,
                o.room_no,
                r.type as room_type,
                r.floor,
                r.parking_slot,
                b.block_name,
                (SELECT COUNT(*) FROM complaints c WHERE c.room_no = o.room_no) as total_complaints,
                (SELECT COUNT(*) FROM complaints c WHERE c.room_no = o.room_no AND c.status = 'Pending') as pending_complaints,
                (SELECT COALESCE(SUM(amount), 0) FROM maintenance m WHERE m.apartment_id = o.room_no AND m.status = 'Unpaid') as pending_maintenance,
                (SELECT COUNT(*) FROM tenant t WHERE t.room_no = o.room_no) as tenants_count,
                (SELECT COUNT(*) FROM feedback f WHERE f.user_id = o.owner_id AND f.user_type = 'owner') as feedbacks_given
            FROM owner o
            LEFT JOIN room r ON o.room_no = r.room_no
            LEFT JOIN block b ON r.block_no = b.block_no
            WHERE o.owner_id = ?
        `;
    } else if (userType === 't') {
        sql = `
            SELECT 
                t.tenant_id,
                t.name,
                t.room_no,
                r.type as room_type,
                r.floor,
                r.parking_slot,
                b.block_name,
                (SELECT COUNT(*) FROM complaints c WHERE c.room_no = t.room_no) as total_complaints,
                (SELECT COUNT(*) FROM complaints c WHERE c.room_no = t.room_no AND c.status = 'Pending') as pending_complaints,
                (SELECT COALESCE(SUM(amount), 0) FROM maintenance m WHERE m.apartment_id = t.room_no AND m.status = 'Unpaid') as pending_maintenance,
                (SELECT name FROM owner o WHERE o.room_no = t.room_no) as owner_name,
                (SELECT COUNT(*) FROM feedback f WHERE f.user_id = t.tenant_id AND f.user_type = 'tenant') as feedbacks_given
            FROM tenant t
            LEFT JOIN room r ON t.room_no = r.room_no
            LEFT JOIN block b ON r.block_no = b.block_no
            WHERE t.tenant_id = ?
        `;
    } else if (userType === 'e') {
        sql = `
            SELECT 
                e.emp_id,
                e.emp_name,
                e.emp_type,
                e.salary,
                e.age,
                b.block_no,
                b.block_name,
                (SELECT COUNT(*) FROM complaints c WHERE c.block_no = e.block_no AND c.status = 'In Progress') as assigned_complaints,
                (SELECT COUNT(*) FROM room r WHERE r.block_no = e.block_no) as total_rooms_in_block
            FROM employee e
            LEFT JOIN block b ON e.block_no = b.block_no
            WHERE e.emp_id = ?
        `;
    } else {
        callback(new Error('Invalid user type'), null);
        return;
    }
    
    con.query(sql, [numericId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

// ============= MAINTENANCE AUDIT LOG FUNCTIONS =============

function getMaintenanceAuditLog(callback) {
    const sql = `
        SELECT 
            mal.*,
            r.type as room_type,
            r.floor,
            o.name as owner_name,
            t.name as tenant_name
        FROM maintenance_audit_log mal
        LEFT JOIN room r ON mal.apartment_id = r.room_no
        LEFT JOIN owner o ON r.room_no = o.room_no
        LEFT JOIN tenant t ON r.room_no = t.room_no
        ORDER BY mal.paid_date DESC
    `;
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function getMaintenanceAuditByApartment(apartmentId, callback) {
    const sql = `
        SELECT * FROM maintenance_audit_log 
        WHERE apartment_id = ? 
        ORDER BY paid_date DESC
    `;
    con.query(sql, [apartmentId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

// ============= VALIDATION FUNCTIONS =============

function validateRoomExists(roomNo, callback) {
    const sql = 'SELECT * FROM room WHERE room_no = ?';
    con.query(sql, [roomNo], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results.length > 0);
    });
}

function validateBlockExists(blockNo, callback) {
    const sql = 'SELECT * FROM block WHERE block_no = ?';
    con.query(sql, [blockNo], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results.length > 0);
    });
}

function validateUserExists(userId, callback) {
    const sql = 'SELECT * FROM auth WHERE user_id = ?';
    con.query(sql, [userId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results.length > 0);
    });
}

// ============= ADVANCED SEARCH & FILTER FUNCTIONS =============

function searchRooms(filters, callback) {
    let sql = 'SELECT r.*, b.block_name FROM room r LEFT JOIN block b ON r.block_no = b.block_no WHERE 1=1';
    const params = [];
    
    if (filters.type) {
        sql += ' AND r.type = ?';
        params.push(filters.type);
    }
    
    if (filters.floor) {
        sql += ' AND r.floor = ?';
        params.push(filters.floor);
    }
    
    if (filters.blockNo) {
        sql += ' AND r.block_no = ?';
        params.push(filters.blockNo);
    }
    
    if (filters.hasParking !== undefined) {
        if (filters.hasParking) {
            sql += ' AND r.parking_slot IS NOT NULL';
        } else {
            sql += ' AND r.parking_slot IS NULL';
        }
    }
    
    sql += ' ORDER BY r.room_no';
    
    con.query(sql, params, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function searchComplaints(filters, callback) {
    let sql = `
        SELECT c.*, r.type as room_type, b.block_name,
               o.name as owner_name, t.name as tenant_name
        FROM complaints c
        LEFT JOIN room r ON c.room_no = r.room_no
        LEFT JOIN block b ON c.block_no = b.block_no
        LEFT JOIN owner o ON r.room_no = o.room_no
        LEFT JOIN tenant t ON r.room_no = t.room_no
        WHERE 1=1
    `;
    const params = [];
    
    if (filters.status) {
        sql += ' AND c.status = ?';
        params.push(filters.status);
    }
    
    if (filters.blockNo) {
        sql += ' AND c.block_no = ?';
        params.push(filters.blockNo);
    }
    
    if (filters.roomNo) {
        sql += ' AND c.room_no = ?';
        params.push(filters.roomNo);
    }
    
    if (filters.dateFrom) {
        sql += ' AND c.reported_date >= ?';
        params.push(filters.dateFrom);
    }
    
    if (filters.dateTo) {
        sql += ' AND c.reported_date <= ?';
        params.push(filters.dateTo);
    }
    
    sql += ' ORDER BY c.reported_date DESC';
    
    con.query(sql, params, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

function searchMaintenance(filters, callback) {
    let sql = `
        SELECT m.*, r.type as room_type, r.floor,
               o.name as owner_name, t.name as tenant_name
        FROM maintenance m
        LEFT JOIN room r ON m.apartment_id = r.room_no
        LEFT JOIN owner o ON r.room_no = o.room_no
        LEFT JOIN tenant t ON r.room_no = t.room_no
        WHERE 1=1
    `;
    const params = [];
    
    if (filters.status) {
        sql += ' AND m.status = ?';
        params.push(filters.status);
    }
    
    if (filters.month) {
        sql += ' AND m.month = ?';
        params.push(filters.month);
    }
    
    if (filters.apartmentId) {
        sql += ' AND m.apartment_id = ?';
        params.push(filters.apartmentId);
    }
    
    if (filters.minAmount) {
        sql += ' AND m.amount >= ?';
        params.push(filters.minAmount);
    }
    
    if (filters.maxAmount) {
        sql += ' AND m.amount <= ?';
        params.push(filters.maxAmount);
    }
    
    sql += ' ORDER BY m.created_at DESC';
    
    con.query(sql, params, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results);
    });
}

// ============= BULK OPERATIONS =============

function bulkUpdateComplaintStatus(complaintIds, status, callback) {
    if (!Array.isArray(complaintIds) || complaintIds.length === 0) {
        callback(new Error('Invalid complaint IDs array'), null);
        return;
    }
    
    const placeholders = complaintIds.map(() => '?').join(',');
    const sql = `UPDATE complaints SET status = ? WHERE complaint_id IN (${placeholders})`;
    const params = [status, ...complaintIds];
    
    con.query(sql, params, callback);
}

function bulkPayMaintenance(maintenanceIds, callback) {
    if (!Array.isArray(maintenanceIds) || maintenanceIds.length === 0) {
        callback(new Error('Invalid maintenance IDs array'), null);
        return;
    }
    
    const placeholders = maintenanceIds.map(() => '?').join(',');
    const sql = `UPDATE maintenance SET status = 'Paid' WHERE maintenance_id IN (${placeholders})`;
    
    con.query(sql, maintenanceIds, callback);
}

// ============= LEASE AGREEMENTS FUNCTIONS =============

function createLeaseAgreement(values, callback) {
    const [tenantId, ownerId, apartmentNo, startDate, endDate, monthlyRent, securityDeposit, leaseTerms] = values;
    
    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
        callback(new Error('Start date must be before end date'), null);
        return;
    }
    
    // Check if apartment exists
    const checkApartmentSql = 'SELECT * FROM room WHERE room_no = ?';
    con.query(checkApartmentSql, [apartmentNo], (err, apartmentResults) => {
        if (err) {
            callback(err, null);
            return;
        }
        
        if (apartmentResults.length === 0) {
            callback(new Error(`Apartment ${apartmentNo} does not exist`), null);
            return;
        }
        
        // Check if tenant exists
        const checkTenantSql = 'SELECT * FROM tenant WHERE tenant_id = ?';
        con.query(checkTenantSql, [tenantId], (err, tenantResults) => {
            if (err) {
                callback(err, null);
                return;
            }
            
            if (tenantResults.length === 0) {
                callback(new Error(`Tenant ID ${tenantId} does not exist`), null);
                return;
            }
            
            // Check if owner exists
            const checkOwnerSql = 'SELECT * FROM owner WHERE owner_id = ?';
            con.query(checkOwnerSql, [ownerId], (err, ownerResults) => {
                if (err) {
                    callback(err, null);
                    return;
                }
                
                if (ownerResults.length === 0) {
                    callback(new Error(`Owner ID ${ownerId} does not exist`), null);
                    return;
                }
                
                // Check for overlapping active leases
                const checkOverlapSql = `
                    SELECT * FROM lease_agreements 
                    WHERE apartment_no = ? 
                    AND status = 'Active'
                    AND (
                        (start_date <= ? AND end_date >= ?) OR
                        (start_date <= ? AND end_date >= ?) OR
                        (start_date >= ? AND end_date <= ?)
                    )
                `;
                con.query(checkOverlapSql, [apartmentNo, startDate, startDate, endDate, endDate, startDate, endDate], (err, overlapResults) => {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    
                    if (overlapResults.length > 0) {
                        callback(new Error(`Apartment ${apartmentNo} already has an active lease for the specified period`), null);
                        return;
                    }
                    
                    // Insert lease agreement
                    const insertSql = `
                        INSERT INTO lease_agreements 
                        (tenant_id, owner_id, apartment_no, start_date, end_date, monthly_rent, security_deposit, lease_terms, status) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
                    `;
                    con.query(insertSql, values, callback);
                });
            });
        });
    });
}

function getAllLeaseAgreements(callback) {
    const sql = `
        SELECT 
            la.*,
            t.name as tenant_name,
            t.age as tenant_age,
            o.name as owner_name,
            r.type as room_type,
            r.floor,
            b.block_name,
            DATEDIFF(la.end_date, CURDATE()) as days_remaining
        FROM lease_agreements la
        INNER JOIN tenant t ON la.tenant_id = t.tenant_id
        INNER JOIN owner o ON la.owner_id = o.owner_id
        INNER JOIN room r ON la.apartment_no = r.room_no
        INNER JOIN block b ON r.block_no = b.block_no
        ORDER BY la.created_at DESC
    `;
    con.query(sql, callback);
}

function getLeaseByTenant(tenantId, callback) {
    const sql = `
        SELECT 
            la.*,
            o.name as owner_name,
            o.age as owner_age,
            r.type as room_type,
            r.floor,
            r.parking_slot,
            b.block_name,
            DATEDIFF(la.end_date, CURDATE()) as days_remaining
        FROM lease_agreements la
        INNER JOIN owner o ON la.owner_id = o.owner_id
        INNER JOIN room r ON la.apartment_no = r.room_no
        INNER JOIN block b ON r.block_no = b.block_no
        WHERE la.tenant_id = ?
        ORDER BY la.start_date DESC
    `;
    con.query(sql, [tenantId], callback);
}

function getLeaseByOwner(ownerId, callback) {
    const sql = `
        SELECT 
            la.*,
            t.name as tenant_name,
            t.age as tenant_age,
            r.type as room_type,
            r.floor,
            b.block_name,
            DATEDIFF(la.end_date, CURDATE()) as days_remaining
        FROM lease_agreements la
        INNER JOIN tenant t ON la.tenant_id = t.tenant_id
        INNER JOIN room r ON la.apartment_no = r.room_no
        INNER JOIN block b ON r.block_no = b.block_no
        WHERE la.owner_id = ?
        ORDER BY la.start_date DESC
    `;
    con.query(sql, [ownerId], callback);
}

function getLeaseByApartment(apartmentNo, callback) {
    const sql = `
        SELECT 
            la.*,
            t.name as tenant_name,
            o.name as owner_name,
            DATEDIFF(la.end_date, CURDATE()) as days_remaining
        FROM lease_agreements la
        INNER JOIN tenant t ON la.tenant_id = t.tenant_id
        INNER JOIN owner o ON la.owner_id = o.owner_id
        WHERE la.apartment_no = ?
        ORDER BY la.start_date DESC
    `;
    con.query(sql, [apartmentNo], callback);
}

function updateLeaseAgreement(agreementId, values, callback) {
    const [tenantId, ownerId, apartmentNo, startDate, endDate, monthlyRent, securityDeposit, leaseTerms, status] = values;
    
    const sql = `
        UPDATE lease_agreements 
        SET tenant_id = ?, owner_id = ?, apartment_no = ?, start_date = ?, 
            end_date = ?, monthly_rent = ?, security_deposit = ?, lease_terms = ?, status = ?
        WHERE agreement_id = ?
    `;
    con.query(sql, [...values, agreementId], callback);
}

function deleteLeaseAgreement(agreementId, callback) {
    const sql = "DELETE FROM lease_agreements WHERE agreement_id = ?";
    con.query(sql, [agreementId], callback);
}

function terminateLease(agreementId, callback) {
    const sql = "UPDATE lease_agreements SET status = 'Terminated' WHERE agreement_id = ?";
    con.query(sql, [agreementId], callback);
}

// ============= LEASE STORED PROCEDURES =============

function getExpiringLeases(days, callback) {
    const sql = 'CALL GetExpiringLeases(?)';
    con.query(sql, [days], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

function getLeaseDetails(leaseId, callback) {
    const sql = 'CALL GetLeaseDetails(?)';
    con.query(sql, [leaseId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0][0]);
    });
}

// ============= LEASE FUNCTIONS =============

function getTotalLeaseValue(leaseId, callback) {
    const sql = 'SELECT GetTotalLeaseValue(?) as total_value';
    con.query(sql, [leaseId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

// ============= LEASE VIEWS =============

function getActiveLeases(callback) {
    const sql = 'SELECT * FROM active_leases_view ORDER BY days_remaining ASC';
    con.query(sql, callback);
}

// ============= VISITORS FUNCTIONS =============

function registerVisitor(values, callback) {
    const [visitorName, apartmentNo, ownerId, tenantId, entryTime, purpose, contactNumber, idProofType, idProofNumber] = values;
    
    // Validate that apartment exists
    const checkApartmentSql = 'SELECT * FROM room WHERE room_no = ?';
    con.query(checkApartmentSql, [apartmentNo], (err, apartmentResults) => {
        if (err) {
            callback(err, null);
            return;
        }
        
        if (apartmentResults.length === 0) {
            callback(new Error(`Apartment ${apartmentNo} does not exist`), null);
            return;
        }
        
        // Insert visitor
        const insertSql = `
            INSERT INTO visitors 
            (visitor_name, apartment_no, owner_id, tenant_id, entry_time, purpose, contact_number, id_proof_type, id_proof_number, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Inside')
        `;
        con.query(insertSql, values, callback);
    });
}

function checkoutVisitor(visitorId, callback) {
    const sql = `
        UPDATE visitors 
        SET exit_time = NOW(), status = 'Exited' 
        WHERE visitor_id = ? AND status = 'Inside'
    `;
    con.query(sql, [visitorId], callback);
}

function getAllVisitors(callback) {
    const sql = `
        SELECT 
            v.*,
            r.type as room_type,
            r.floor,
            b.block_name,
            CASE 
                WHEN v.owner_id IS NOT NULL THEN o.name
                WHEN v.tenant_id IS NOT NULL THEN t.name
                ELSE 'Unknown'
            END as host_name,
            CASE 
                WHEN v.owner_id IS NOT NULL THEN 'Owner'
                WHEN v.tenant_id IS NOT NULL THEN 'Tenant'
                ELSE 'Unknown'
            END as host_type,
            CASE 
                WHEN v.exit_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, v.entry_time, v.exit_time)
                ELSE TIMESTAMPDIFF(MINUTE, v.entry_time, NOW())
            END as duration_minutes
        FROM visitors v
        INNER JOIN room r ON v.apartment_no = r.room_no
        INNER JOIN block b ON r.block_no = b.block_no
        LEFT JOIN owner o ON v.owner_id = o.owner_id
        LEFT JOIN tenant t ON v.tenant_id = t.tenant_id
        ORDER BY v.entry_time DESC
    `;
    con.query(sql, callback);
}

function getVisitorsByApartment(apartmentNo, callback) {
    const sql = `
        SELECT 
            v.*,
            CASE 
                WHEN v.owner_id IS NOT NULL THEN o.name
                WHEN v.tenant_id IS NOT NULL THEN t.name
                ELSE 'Unknown'
            END as host_name,
            CASE 
                WHEN v.exit_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, v.entry_time, v.exit_time)
                ELSE TIMESTAMPDIFF(MINUTE, v.entry_time, NOW())
            END as duration_minutes
        FROM visitors v
        LEFT JOIN owner o ON v.owner_id = o.owner_id
        LEFT JOIN tenant t ON v.tenant_id = t.tenant_id
        WHERE v.apartment_no = ?
        ORDER BY v.entry_time DESC
    `;
    con.query(sql, [apartmentNo], callback);
}

function getCurrentVisitors(callback) {
    const sql = 'CALL GetCurrentVisitors()';
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

function getApartmentVisitorHistory(apartmentNo, days, callback) {
    const sql = 'CALL GetApartmentVisitorHistory(?, ?)';
    con.query(sql, [apartmentNo, days], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

function updateVisitor(visitorId, values, callback) {
    const [visitorName, apartmentNo, purpose, contactNumber, idProofType, idProofNumber] = values;
    
    const sql = `
        UPDATE visitors 
        SET visitor_name = ?, apartment_no = ?, purpose = ?, 
            contact_number = ?, id_proof_type = ?, id_proof_number = ?
        WHERE visitor_id = ?
    `;
    con.query(sql, [...values, visitorId], callback);
}

function deleteVisitor(visitorId, callback) {
    const sql = "DELETE FROM visitors WHERE visitor_id = ?";
    con.query(sql, [visitorId], callback);
}

// ============= VISITOR FUNCTIONS =============

function getApartmentVisitorCount(apartmentNo, days, callback) {
    const sql = 'SELECT GetApartmentVisitorCount(?, ?) as visitor_count';
    con.query(sql, [apartmentNo, days], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

// ============= VISITOR VIEWS =============

function getVisitorStatistics(callback) {
    const sql = 'SELECT * FROM visitor_statistics_view ORDER BY total_visitors DESC';
    con.query(sql, callback);
}

// ============= VISITORS WITH APPROVAL WORKFLOW =============

// Request visitor (Owner/Tenant creates request)
function requestVisitor(values, callback) {
    const [visitorName, apartmentNo, ownerId, tenantId, requestedBy, requesterId, entryTime, purpose, contactNumber, idProofType, idProofNumber] = values;
    
    // Validate that apartment exists
    const checkApartmentSql = 'SELECT * FROM room WHERE room_no = ?';
    con.query(checkApartmentSql, [apartmentNo], (err, apartmentResults) => {
        if (err) {
            callback(err, null);
            return;
        }
        
        if (apartmentResults.length === 0) {
            callback(new Error(`Apartment ${apartmentNo} does not exist`), null);
            return;
        }
        
        // Insert visitor request
        const insertSql = `
            INSERT INTO visitors 
            (visitor_name, apartment_no, owner_id, tenant_id, requested_by, requester_id, 
             entry_time, purpose, contact_number, id_proof_type, id_proof_number, 
             approval_status, visitor_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Requested')
        `;
        con.query(insertSql, values, callback);
    });
}

// Get pending visitor requests (Admin view)
function getPendingVisitorRequests(callback) {
    const sql = 'CALL GetPendingVisitorRequests()';
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

// Approve visitor request (Admin only)
function approveVisitorRequest(visitorId, adminId, callback) {
    const sql = `
        UPDATE visitors 
        SET approval_status = 'Approved', 
            visitor_status = 'Approved',
            approved_by = ?, 
            approved_at = NOW() 
        WHERE visitor_id = ? AND approval_status = 'Pending'
    `;
    con.query(sql, [adminId, visitorId], callback);
}

// Reject visitor request (Admin only)
function rejectVisitorRequest(visitorId, adminId, rejectionReason, callback) {
    const sql = `
        UPDATE visitors 
        SET approval_status = 'Rejected', 
            visitor_status = 'Rejected',
            approved_by = ?, 
            approved_at = NOW(),
            rejection_reason = ?
        WHERE visitor_id = ? AND approval_status = 'Pending'
    `;
    con.query(sql, [adminId, rejectionReason, visitorId], callback);
}

// Get approved visitors ready for check-in (Security/Admin view)
function getApprovedVisitors(callback) {
    const sql = 'CALL GetApprovedVisitors()';
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

// Check-in visitor (Security/Admin - after approval)
function checkinVisitor(visitorId, callback) {
    const sql = `
        UPDATE visitors 
        SET visitor_status = 'Inside',
            entry_time = NOW()
        WHERE visitor_id = ? 
        AND approval_status = 'Approved' 
        AND visitor_status = 'Approved'
    `;
    con.query(sql, [visitorId], callback);
}

// Checkout visitor (Security/Admin/Employee)
function checkoutVisitor(visitorId, callback) {
    const sql = `
        UPDATE visitors 
        SET exit_time = NOW(), 
            visitor_status = 'Exited' 
        WHERE visitor_id = ? AND visitor_status = 'Inside'
    `;
    con.query(sql, [visitorId], callback);
}

// Get current visitors inside
function getCurrentVisitorsInside(callback) {
    const sql = 'CALL GetCurrentVisitorsInside()';
    con.query(sql, (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

// Get my visitor requests (Owner/Tenant view)
function getMyVisitorRequests(userType, userId, callback) {
    const sql = 'CALL GetMyVisitorRequests(?, ?)';
    con.query(sql, [userType, userId], (err, results) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, results[0]);
    });
}

// Get all visitors (Admin view)
function getAllVisitors(callback) {
    const sql = `
        SELECT 
            v.*,
            r.type as room_type,
            r.floor,
            b.block_name,
            CASE 
                WHEN v.requested_by = 'owner' THEN o.name
                WHEN v.requested_by = 'tenant' THEN t.name
                ELSE 'Unknown'
            END as requester_name,
            CASE 
                WHEN v.approved_by IS NOT NULL THEN ba.admin_name
                ELSE NULL
            END as approved_by_name,
            CASE 
                WHEN v.exit_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, v.entry_time, v.exit_time)
                WHEN v.visitor_status = 'Inside' THEN TIMESTAMPDIFF(MINUTE, v.entry_time, NOW())
                ELSE NULL
            END as duration_minutes
        FROM visitors v
        INNER JOIN room r ON v.apartment_no = r.room_no
        INNER JOIN block b ON r.block_no = b.block_no
        LEFT JOIN owner o ON v.requester_id = o.owner_id AND v.requested_by = 'owner'
        LEFT JOIN tenant t ON v.requester_id = t.tenant_id AND v.requested_by = 'tenant'
        LEFT JOIN block_admin ba ON v.approved_by = ba.admin_id
        ORDER BY v.created_at DESC
    `;
    con.query(sql, callback);
}

// Get visitors by apartment
function getVisitorsByApartment(apartmentNo, callback) {
    const sql = `
        SELECT 
            v.*,
            CASE 
                WHEN v.requested_by = 'owner' THEN o.name
                WHEN v.requested_by = 'tenant' THEN t.name
                ELSE 'Unknown'
            END as requester_name,
            CASE 
                WHEN v.exit_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, v.entry_time, v.exit_time)
                WHEN v.visitor_status = 'Inside' THEN TIMESTAMPDIFF(MINUTE, v.entry_time, NOW())
                ELSE NULL
            END as duration_minutes
        FROM visitors v
        LEFT JOIN owner o ON v.requester_id = o.owner_id AND v.requested_by = 'owner'
        LEFT JOIN tenant t ON v.requester_id = t.tenant_id AND v.requested_by = 'tenant'
        WHERE v.apartment_no = ?
        ORDER BY v.created_at DESC
    `;
    con.query(sql, [apartmentNo], callback);
}

// Update visitor request (before approval)
function updateVisitorRequest(visitorId, values, callback) {
    const [visitorName, apartmentNo, purpose, contactNumber, idProofType, idProofNumber, entryTime] = values;
    
    const sql = `
        UPDATE visitors 
        SET visitor_name = ?, apartment_no = ?, purpose = ?, 
            contact_number = ?, id_proof_type = ?, id_proof_number = ?,
            entry_time = ?
        WHERE visitor_id = ? AND approval_status = 'Pending'
    `;
    con.query(sql, [...values, visitorId], callback);
}

// Delete visitor request (only if not approved)
function deleteVisitorRequest(visitorId, callback) {
    const sql = "DELETE FROM visitors WHERE visitor_id = ? AND approval_status = 'Pending'";
    con.query(sql, [visitorId], callback);
}

// Get visitor approval statistics
function getVisitorApprovalStats(callback) {
    const sql = 'SELECT * FROM visitor_approval_stats';
    con.query(sql, callback);
}

// Cancel visitor request (by requester, only if pending)
function cancelVisitorRequest(visitorId, requesterId, callback) {
    const sql = `
        UPDATE visitors 
        SET approval_status = 'Cancelled',
            visitor_status = 'Cancelled'
        WHERE visitor_id = ? 
        AND requester_id = ?
        AND approval_status = 'Pending'
    `;
    con.query(sql, [visitorId, requesterId], callback);
}



// ============= EXPORTS =============
module.exports = {
    // Connection
    connect,
    
    // Authentication
    authoriseuser,
    createuserid,
    
    // Complaints
    registercomplaint,
    viewcomplaints,
    viewcomplaint: viewcomplaints,
    ownercomplaints,
    totalcomplaint,
    updateComplaintStatus,
    deleteComplaint,
    
    // Owner Functions
    createowner,
    createownerproof,
    totalowner,
    ownerroomdetails,
    ownertenantdetails,
    updateOwner,
    deleteOwner,
    
    // Tenant Functions
    createtenant,
    createtenantproof,
    totaltenant,
    gettenantdata,
    paymaintanence,
    updateTenant,
    deleteTenant,
    
    // Employee Functions
    createEmployee,
    totalemployee,
    empsalary,
    updateEmployee,
    deleteEmployee,
    
    // Parking & Room Functions
    bookslot,
    viewparking,
    getBlocks,
    addRoom,
    deleteRoom,
    
    // General Functions
    getdata,
    
    // Community Events
    createEvent,
    getEvents,
    updateEvent,
    deleteEvent,
    
    // Amenities
    createAmenity,
    getAmenities,
    updateAmenity,
    deleteAmenity,
    
    // Service Providers
    createServiceProvider,
    getServiceProviders,
    updateServiceProvider,
    deleteServiceProvider,
    
    // Maintenance Functions
    createMaintenance,
    getAllMaintenance,
    getMaintenanceByApartment,
    updateMaintenance,
    deleteMaintenance,
    payMaintenance,
    
    // Feedback Functions
    createFeedback,
    getAllFeedback,
    getFeedbackByUser,
    updateFeedback,
    deleteFeedback,
    updateFeedbackStatus,
    
    // Stored Procedures
    getUserCompleteProfile,
    getMaintenanceSummary,
    getBlockStatistics,
    generateMonthlyMaintenance,
    getTopRatedServices,
    
    // User-Defined Functions
    getUserPendingMaintenance,
    getUserComplaintCount,
    getBlockOccupancyRate,
    
    // Complex Views
    getRoomCompleteDetails,
    getMaintenanceDashboard,
    getUserActivitySummary,
    
    // Advanced Aggregates
    getComplaintStatistics,
    getMaintenanceCollectionReport,
    getFeedbackStatistics,
    getRoomOccupancyByBlock,
    getAverageMaintenanceByRoomType,
    
    // Complex Nested Queries
    getUserDashboardData,
    
    // Maintenance Audit
    getMaintenanceAuditLog,
    getMaintenanceAuditByApartment,
    
    // Validation Functions
    validateRoomExists,
    validateBlockExists,
    validateUserExists,
    
    // Search & Filter
    searchRooms,
    searchComplaints,
    searchMaintenance,
    
    // Bulk Operations
    bulkUpdateComplaintStatus,
    bulkPayMaintenance,
    // Lease Agreements
    createLeaseAgreement,
    getAllLeaseAgreements,
    getLeaseByTenant,
    getLeaseByOwner,
    getLeaseByApartment,
    updateLeaseAgreement,
    deleteLeaseAgreement,
    terminateLease,
    getExpiringLeases,
    getLeaseDetails,
    getTotalLeaseValue,
    getActiveLeases,
    
    // Visitors
    registerVisitor,
    checkoutVisitor,
    getAllVisitors,
    getVisitorsByApartment,
    getCurrentVisitors,
    getApartmentVisitorHistory,
    updateVisitor,
    deleteVisitor,
    getApartmentVisitorCount,
    getVisitorStatistics,

    requestVisitor,
    getPendingVisitorRequests,
    approveVisitorRequest,
    rejectVisitorRequest,
    getApprovedVisitors,
    checkinVisitor,
    checkoutVisitor,
    getCurrentVisitorsInside,
    getMyVisitorRequests,
    getAllVisitors,
    getVisitorsByApartment,
    updateVisitorRequest,
    deleteVisitorRequest,
    getVisitorApprovalStats,
    cancelVisitorRequest
};