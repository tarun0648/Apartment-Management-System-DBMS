const express = require("express");
const bodyParser = require('body-parser');
const db = require('./mysql_connect');
const dashB = require('./routes/dashb');
const cors = require("cors");

const port = 5000;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/dashboard", dashB);
app.use(cors());

app.listen(port, () => {
  console.log("Server started to listen...");
}); 

app.get('/', function(req, res) {
  res.send("Only accepting GET and POST requests!");
});

// ============= AUTHENTICATION =============
app.post("/auth", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  let rep = "unknown";
  let acces = "denied";

  if(username && username.toUpperCase().charAt(0) === "E" && password && password.length >= 6) {
    rep = "employee";
  } else if (username && username.toUpperCase().charAt(0) === "A" && password && password.length >= 6) {
    rep = "admin";
  } else if (username && username.toUpperCase().charAt(0) === "T" && password && password.length >= 6) {
    rep = "tenant";
  } else if (username && username.toUpperCase().charAt(0) === "O" && password && password.length >= 6) {
    rep = "owner";
  } else if(password.length < 6) {
    res.send({ user: "passunknown" });
    return;
  } else {
    res.send({ user: "unknown" });
    return;
  }

  db.authoriseuser(username, password, (err, result) => {
    if(err) console.log(err);
    acces = result;
    res.send({
      access: acces,
      user: rep,
    });
  });
});

// ============= MAINTENANCE ROUTES =============

// Create maintenance (Admin only)
app.post('/createmaintenance', (req, res) => {
  const { month, amount, status, apartmentId, dueDate } = req.body;
  const values = [month, amount, status || 'Unpaid', apartmentId, dueDate];
  
  db.createMaintenance(values, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Maintenance created successfully' });
    }
  });
});

// Get all maintenance
app.get('/maintenance', (req, res) => {
  db.getAllMaintenance((err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.send(result);
    }
  });
});

// Get maintenance by apartment
app.post('/maintenance/apartment', (req, res) => {
  const { apartmentId } = req.body;
  db.getMaintenanceByApartment(apartmentId, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.send(result);
    }
  });
});

// Update maintenance (Admin only)
app.put('/updatemaintenance/:id', (req, res) => {
  const maintenanceId = req.params.id;
  const { month, amount, status, apartmentId, dueDate } = req.body;
  const values = [month, amount, status, apartmentId, dueDate];
  
  db.updateMaintenance(maintenanceId, values, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Maintenance updated successfully' });
    }
  });
});

// Delete maintenance (Admin only)
app.delete('/deletemaintenance/:id', (req, res) => {
  const maintenanceId = req.params.id;
  
  db.deleteMaintenance(maintenanceId, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Maintenance deleted successfully' });
    }
  });
});

// Pay maintenance
app.post('/paymaintenance/:id', (req, res) => {
  const maintenanceId = req.params.id;
  
  db.payMaintenance(maintenanceId, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Maintenance paid successfully' });
    }
  });
});

// ============= FEEDBACK ROUTES =============

// Create feedback (Owner/Tenant)
app.post('/createfeedback', (req, res) => {
  const { userId, userType, feedbackText, rating } = req.body;
  const values = [userId, userType, feedbackText, rating || null];
  
  db.createFeedback(values, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Feedback submitted successfully' });
    }
  });
});

// Get all feedback (Admin view)
app.get('/feedback', (req, res) => {
  db.getAllFeedback((err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.send(result);
    }
  });
});

// Get feedback by user
app.post('/feedback/user', (req, res) => {
  const { userId, userType } = req.body;
  db.getFeedbackByUser(userId, userType, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.send(result);
    }
  });
});

// Update feedback
app.put('/updatefeedback/:id', (req, res) => {
  const feedbackId = req.params.id;
  const { feedbackText, rating } = req.body;
  const values = [feedbackText, rating || null];
  
  db.updateFeedback(feedbackId, values, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Feedback updated successfully' });
    }
  });
});

// Delete feedback
app.delete('/deletefeedback/:id', (req, res) => {
  const feedbackId = req.params.id;
  
  db.deleteFeedback(feedbackId, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Feedback deleted successfully' });
    }
  });
});

// Update feedback status (Admin)
app.put('/feedbackstatus/:id', (req, res) => {
  const feedbackId = req.params.id;
  const { status } = req.body;
  
  db.updateFeedbackStatus(feedbackId, status, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Feedback status updated successfully' });
    }
  });
});

// ============= EDIT/DELETE ROUTES FOR EXISTING FEATURES =============

// Update owner
app.put('/updateowner/:id', (req, res) => {
  const ownerId = req.params.id;
  const { name, age, aggrementStatus, roomno, dob } = req.body;
  const values = [name, age, aggrementStatus, roomno, dob];
  
  db.updateOwner(ownerId, values, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Owner updated successfully' });
    }
  });
});

// Delete owner
app.delete('/deleteowner/:id', (req, res) => {
  const ownerId = req.params.id;
  
  db.deleteOwner(ownerId, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Owner deleted successfully' });
    }
  });
});

// Update tenant
app.put('/updatetenant/:id', (req, res) => {
  const tenantId = req.params.id;
  const { name, dob, stat, roomno, age } = req.body;
  const values = [name, dob, stat, roomno, age];
  
  db.updateTenant(tenantId, values, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Tenant updated successfully' });
    }
  });
});

// Delete tenant
app.delete('/deletetenant/:id', (req, res) => {
  const tenantId = req.params.id;
  
  db.deleteTenant(tenantId, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Tenant deleted successfully' });
    }
  });
});

// Update employee
app.put('/updateemployee/:id', (req, res) => {
  const empId = req.params.id;
  const { empName, salary, empType, age, blockNo } = req.body;
  const values = [empName, salary, empType, age, blockNo];
  
  db.updateEmployee(empId, values, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Employee updated successfully' });
    }
  });
});

// Delete employee
app.delete('/deleteemployee/:id', (req, res) => {
  const empId = req.params.id;
  
  db.deleteEmployee(empId, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Employee deleted successfully' });
    }
  });
});

// Update complaint status
app.put('/complaintsstatus/:id', (req, res) => {
  const complaintId = req.params.id;
  const { status } = req.body;
  
  db.updateComplaintStatus(complaintId, status, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Complaint status updated successfully' });
    }
  });
});

// Delete complaint
app.delete('/deletecomplaints/:id', (req, res) => {
  const complaintId = req.params.id;
  
  db.deleteComplaint(complaintId, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Complaint deleted successfully' });
    }
  });
});

// Update event
app.put('/updateevent/:id', (req, res) => {
  const eventId = req.params.id;
  const { apartmentId, location, description, organizerId, eventName, eventDate } = req.body;
  const values = [apartmentId, location, description, organizerId, eventName, eventDate];
  
  db.updateEvent(eventId, values, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Event updated successfully' });
    }
  });
});

// Delete event
app.delete('/deleteevent/:id', (req, res) => {
  const eventId = req.params.id;
  
  db.deleteEvent(eventId, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Event deleted successfully' });
    }
  });
});

// Update amenity
app.put('/updateamenity/:id', (req, res) => {
  const amenityId = req.params.id;
  const { amenityName, description, phoneNumber, email, rating } = req.body;
  const values = [amenityName, description, phoneNumber, email, rating];
  
  db.updateAmenity(amenityId, values, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Amenity updated successfully' });
    }
  });
});

// Delete amenity
app.delete('/deleteamenity/:id', (req, res) => {
  const amenityId = req.params.id;
  
  db.deleteAmenity(amenityId, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Amenity deleted successfully' });
    }
  });
});

// Update service provider
app.put('/updateserviceprovider/:id', (req, res) => {
  const providerId = req.params.id;
  const { providerName, serviceType, contactNumber, email, rating } = req.body;
  const values = [providerName, serviceType, contactNumber, email, rating];
  
  db.updateServiceProvider(providerId, values, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Service provider updated successfully' });
    }
  });
});

// Delete service provider
app.delete('/deleteserviceprovider/:id', (req, res) => {
  const providerId = req.params.id;
  
  db.deleteServiceProvider(providerId, (err, result) => {
    if(err) {
      console.log(err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: 'Service provider deleted successfully' });
    }
  });
});

// ============= EXISTING ROUTES (KEEP ALL) =============

app.post('/raisingcomplaint', function(req, res) {
  console.log('Received complaint:', req.body);
  const desc = req.body.descp;
  const blockno = req.body.blockno;
  const roomno = req.body.roomno;
  const userId = req.body.userId;
  const userType = req.body.userType;
  const reportedBy = `${userType}-${userId}`;
  
  const values = [desc, reportedBy, blockno, roomno];
  console.log('Processing complaint with values:', values);
  
  db.registercomplaint(values, (err, result) => {
    if(err) {
      console.log('Error registering complaint:', err);
      res.status(500).json({ error: err.message });
    } else {
      console.log('Complaint registered successfully:', result);
      res.status(200).json({ message: 'Complaint registered successfully' });
    }
  });
});

app.post('/createtenant', function(req, res) {
  const name = req.body.name;
  const age = req.body.age;
  const tenantno = req.body.tenantno;  
  const adhaar = req.body.adhaar;
  const roomno = req.body.roomno;
  const password = req.body.password;
  const dob = req.body.dob;
  const values = [tenantno, name, dob, roomno, age];
  
  db.createtenant(values, (err, result) => {
    if(err) console.log(err);
    const prof = [adhaar, tenantno];
    const vals = ["t-" + tenantno, password, tenantno];
    
    db.createtenantproof(prof, (err, result) => {
      if(err) console.log(err);
    });
    
    db.createuserid(vals, (err, result) => {
      if(err) console.log(err);
      else res.sendStatus(200);
    });
  });
});

app.post('/createowner', (req, res) => {
  const ownerid = req.body.ownerId;
  const name = req.body.name;
  const age = req.body.age;
  const aggrement_status = req.body.aggrementStatus;
  const roomno = req.body.roomno;
  const dob = req.body.dob;
  const proof = req.body.adhaar;
  const values = [ownerid, name, age, aggrement_status, roomno, dob];
  const proofval = [proof, ownerid];
  const password = req.body.password;
  const vals = ["o-" + ownerid, password, ownerid];

  db.createowner(values, (err, result) => {
    if(err) console.log(err);
  });
  
  db.createownerproof(proofval, (err, result) => {
    if(err) console.log(err);
  });
  
  db.createuserid(vals, (err, result) => {
    if(err) console.log(err);
    else res.sendStatus(200);
  });
});

app.get('/tenantdetails', (req, res) => {
  db.getdata('tenant', (err, result) => {
    res.send(result);
  });
});

app.get('/ownerdetails', (req, res) => {
  db.getdata('owner', (err, result) => {
    res.send(result);
  });
});

app.post('/viewparking', (req, res) => {
  const id = req.body.userId;
  db.viewparking(id, (err, result) => {
    if(err) console.log(err);
    res.send(result);
  });
});

app.post('/bookslot', (req, res) => {
  const slno = req.body.slotno;
  const roomno = req.body.roomno;
  const regno = req.body.regno;
  const values = [slno, regno, roomno];

  db.bookslot(values, (err, result) => {
    if(err) {
      console.error("Error booking slot:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "Failed to update parking slot"
      });
    }
    
    res.json({
      success: true,
      message: `Successfully assigned parking slot ${slno} to room ${roomno}`
    });
  });
});

app.post('/ownertenantdetails', (req, res) => {
  const id = req.body.userId;
  db.ownertenantdetails(id, (err, result) => {
    if(err) {
      console.log(err);
      res.sendStatus(405);
    } else {
      res.send(result);
    }
  });
});

app.post('/paymaintanance', (req, res) => {
  const id = req.body.userId;
  db.paymaintanence(id, (err, result) => {
    if(err) {
      console.log(err);
      res.sendStatus(405);
    } else {
      res.sendStatus(200);
    }
  });
});

app.post('/createevent', function(req, res) {
  const { eventId, apartmentId, location, description, organizerId, eventName, eventDate } = req.body;
  const values = [eventId, apartmentId, location, description, organizerId, eventName, eventDate];
  
  db.createEvent(values, (err, result) => {
    if(err) {
      console.log(err);
      res.sendStatus(405);
    } else {
      res.sendStatus(200);
    }
  });
});

app.get('/events', function(req, res) {
  db.getEvents((err, result) => {
    if(err) {
      console.log(err);
      res.sendStatus(405);
    } else {
      res.send(result);
    }
  });
});

app.post('/createamenity', function(req, res) {
  const { amenityId, amenityName, description, phoneNumber, email, rating } = req.body;
  const values = [amenityId, amenityName, description, phoneNumber, email, rating];
  
  db.createAmenity(values, (err, result) => {
    if(err) {
      console.log(err);
      res.sendStatus(405);
    } else {
      res.sendStatus(200);
    }
  });
});

app.get('/amenities', function(req, res) {
  db.getAmenities((err, result) => {
    if(err) {
      console.log(err);
      res.sendStatus(405);
    } else {
      res.send(result);
    }
  });
});

app.post('/createserviceprovider', function(req, res) {
  const { providerId, providerName, serviceType, contactNumber, email, rating } = req.body;
  const values = [providerId, providerName, serviceType, contactNumber, email, rating];
  
  db.createServiceProvider(values, (err, result) => {
    if(err) {
      console.log(err);
      res.sendStatus(405);
    } else {
      res.sendStatus(200);
    }
  });
});

app.get('/serviceproviders', function(req, res) {
  db.getServiceProviders((err, result) => {
    if(err) {
      console.log(err);
      res.sendStatus(405);
    } else {
      res.send(result);
    }
  });
});

app.get('/complaints', function(req, res) {
  db.viewcomplaint((err, result) => {
    if(err) {
      console.log(err);
      res.sendStatus(405);
    } else {
      res.send(result);
    }
  });
});

app.post('/createemployee', function(req, res) {
  const empid = req.body.empId;
  const empname = req.body.empName;
  const salary = req.body.salary;
  const emptype = req.body.empType;
  const age = req.body.age;
  const blockno = req.body.blockNo;
  const password = req.body.password;
  const values = [empid, empname, salary, emptype, age, blockno];
  const vals = ["e-" + empid, password, empid];

  db.createemployee(values, (err, result) => {
    if(err) console.log(err);
  });

  db.createuserid(vals, (err, result) => {
    if(err) console.log(err);
    else res.sendStatus(200);
  });
});