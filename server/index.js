const express = require("express");
const bodyParser = require('body-parser');
const db = require('./mysql_connect');
const dashB = require('./routes/dashb');
const cors = require("cors")


//port number to listen
const port = 5000;

//init
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/dashboard",dashB);
app.use(cors())


//initializing
app.listen(port,()=>{
  console.log("Server starten to listen...");
}); 


//home page 
app.get('/', function(req, res){
  res.send("Only accepting GET and POST requests!");
});



//authorisation
app.post("/auth", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  let rep = "unknown";
  let acces = "denied";

  if(username &&
    username.toUpperCase().charAt(0) === "E" &&
    password &&
    password.length >= 6){
      rep = "employee";

      // res.send({ user: "employee" });
    }else if (
    username &&
    username.toUpperCase().charAt(0) === "A" &&
    password &&
    password.length >= 6
  ) {
    rep = "admin";
  }else if (
    username &&
    username.toUpperCase().charAt(0) === "T" &&
    password &&
    password.length >= 6
  ) {
    rep = "tenant";
  }else if (
    username &&
    username.toUpperCase().charAt(0) === "O" &&
    password &&
    password.length >= 6
  ) {
    rep= "owner";
  }  else if(password.length < 6) {
    res.send({ user: "passunknown" });
  }else {
    res.send({ user: "unknown" });
  }

  const resul =db.authoriseuser(username,password,(err,result)=>{
    if(err) console.log(err);
    acces = result;
    console.log(acces);
    res.send({
      access: acces,
      user: rep,
    });
  })
});


//register complaint
app.post('/raisingcomplaint',function(req,res){
    console.log('Received complaint:', req.body);
    const desc = req.body.descp;
    const blockno = req.body.blockno;
    const roomno = req.body.roomno;
    const userId = req.body.userId;
    const userType = req.body.userType;
    const reportedBy = `${userType}-${userId}`;
    
    const values = [desc, reportedBy, blockno, roomno];
    console.log('Processing complaint with values:', values);
    
    db.registercomplaint(values,(err,result)=>{
      if(err) {
        console.log('Error registering complaint:', err);
        res.status(500).json({ error: err.message });
      } else {
        console.log('Complaint registered successfully:', result);
        res.status(200).json({ message: 'Complaint registered successfully' });
      }
    })
});

//create a new tenant by owner
app.post('/createtenant',function(req,res){
  const name = req.body.name;
  const age = req.body.age;
  const tenantno = req.body.tenantno;  
  const adhaar = req.body.adhaar;
  const roomno = req.body.roomno;
  const password = req.body.password;
  const dob = req.body.dob;
  const values = [tenantno,name,dob,roomno,age];
  const resul =db.createtenant(values,(err,result)=>{
    if(err) console.log(err);
  const prof = [adhaar,tenantno];
  const vals = ["t-"+tenantno,password,tenantno];
  const resul =db.createtenantproof(prof,(err,result)=>{
    if(err) console.log(err);//res.sendStatus(404);
  })
  const respn =db.createuserid(vals,(err,result)=>{
    if(err) console.log(err);//res.sendStatus(404);
    else res.sendStatus(200);
  })
});
});


//creates owner in owner table
app.post('/createowner',(req,res)=>
{
  const ownerid = req.body.ownerId;
    const name = req.body.name;
    const age = req.body.age;
    const aggrement_status = req.body.aggrementStatus;
    const roomno = req.body.roomno;
    const dob = req.body.dob;
    const proof = req.body.adhaar;
    const values = [ownerid,name,age,aggrement_status,roomno,dob];
    const proofval = [proof,ownerid];
    const password = req.body.password;
    const vals = ["o-"+ownerid,password,ownerid];

    const rest = db.createowner(values,(err,result)=>{
      if(err) console.log(err);//res.sendStatus(404);
  });
  const rep = db.createownerproof(proofval,(err,result)=>{
    console.log(proofval);
    if(err) console.log(err);//res.sendStatus(404);
});
const respn =db.createuserid(vals,(err,result)=>{
  if(err) console.log(err);//res.sendStatus(404);
  else res.sendStatus(200);
})
});



//get the tenent details fetch all data from table
app.get('/tenantdetails',(req,res)=>
{
    const rest = db.getdata('tenant',(err,result)=>
    {
      res.send(result);
    })
})



//get the owner details fetch all the data from the table
app.get('/ownerdetails',(req,res)=>
{
    const rest = db.getdata('owner',(err,result)=>
    {
      res.send(result);
    })
})

//view parkings owned by tenant
app.post('/viewparking',(req,res)=>
{
  const id = req.body.userId;
  const rest = db.viewparking(id,(err,result)=>
  {
    if(err) console.log(err);
    res.send(result);
  })
})



//get the room details owned by the owner
app.post('/ownercomplaints',(req,res)=>
{
  const ownerid = req.body.userId;
    const rest = db.ownercomplaints(ownerid,(err,result)=>
    {
      if(err) console.log(err);
      res.send(result);
    })
})


//view complaints that are in the database
app.get('/viewcomplaints',(req,res)=>
{
    const rest = db.viewcomplaints((err,result)=>
    {
      res.send(result);
    })
})


//getonlycomplaints according to owner
app.post('/ownerroomdetails',(req,res)=>
{
    const ownerId = req.body.userId;
    const rest = db.ownerroomdetails(ownerId,(err,result)=>
    {
      if(err) console.log(err);
      res.send(result);
    })
})




//books parking slot for tenents
//create employee
app.post('/createemployee', function(req, res) {
  const name = req.body.name;
  const age = req.body.age;
  const empId = req.body.empId;
  const salary = req.body.salary;
  const empType = req.body.empType;
  const blockNo = req.body.blockNo;
  const password = req.body.password;
  
  const values = [empId, name, salary, empType, age, blockNo];
  const vals = ["e-"+empId, password, empId];

  const rest = db.createEmployee(values, (err, result) => {
    if(err) {
      console.log(err);
      res.sendStatus(405);
    } else {
      const auth = db.createuserid(vals, (err, result) => {
        if(err) {
          console.log(err);
          res.sendStatus(405);
        } else {
          res.sendStatus(200);
        }
      });
    }
  });
});

app.post('/bookslot',(req,res)=>
{
    const roomno = req.body.roomNo;
    const slno = req.body.slotNo;
    
    console.log('Received request to update parking slot:', { roomno, slno });

    if (!roomno || roomno.trim() === '') {
        return res.status(400).json({
            success: false,
            message: "Room number is required"
        });
    }

    if (!slno || slno.trim() === '') {
        return res.status(400).json({
            success: false,
            message: "Parking slot number is required"
        });
    }

    const values = [slno.trim(), roomno.trim()];
    console.log('Updating with values:', values);

    db.bookslot(values, (err, result) => {
        if(err) {
            console.error("Error booking slot:", err);
            return res.status(400).json({
                success: false,
                message: err.message || "Failed to update parking slot"
            });
        }
        
        console.log('Successfully updated parking slot');
        res.json({
            success: true,
            message: `Successfully assigned parking slot ${slno} to room ${roomno}`
        });
      
  })
});


app.post('/ownertenantdetails',(req,res)=>
{
    const id = req.body.userId;
    const rest = db.ownertenantdetails(id,(err,result)=>{
      if(err) console.log(err);
      if(err) res.sendStatus(405);
      else{
        res.send(result);
      }
  })
});

app.post('/paymaintanance',(req,res)=>
{
    const id = req.body.userId;
    const rest = db.paymaintanence(id,(err,result)=>{
      if(err) console.log(err);
      if(err) res.sendStatus(405);
      else{
        res.sendStatus(200);
      }
  })
});
//Other routes
// Community Events endpoints
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

// Amenities endpoints
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

// Service Providers endpoints
app.post('/createserviceprovider', function(req, res) {
  const { providerId, providerName, serviceType, contactPerson, phoneNumber, email } = req.body;
  const values = [providerId, providerName, serviceType, contactPerson, phoneNumber, email];
  
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

// Get all blocks
app.get('/blocks', (req, res) => {
    db.getBlocks((err, results) => {
        if (err) {
            console.error('Error getting blocks:', err);
            res.status(500).json({ error: 'Failed to fetch blocks' });
            return;
        }
        res.json(results);
    });
});

// Add new room to a block
app.post('/addroom', (req, res) => {
    const { blockNo, roomNo, type, floor, regNo, parkingSlot } = req.body;
    
    // Validate required fields
    if (!blockNo || !roomNo || !type || !floor || !regNo) {
        res.status(400).json({ error: 'Block number, room number, type, floor, and registration number are required' });
        return;
    }

    // Validate floor number
    if (floor < 0) {
        res.status(400).json({ error: 'Floor number must be non-negative' });
        return;
    }

    const values = [roomNo, type, floor, parkingSlot || null, regNo, blockNo];
    db.addRoom(values, (err, result) => {
        if (err) {
            console.error('Error adding room:', err);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Room added successfully' });
    });
});

app.get('*', function(req, res){
  res.send('Sorry, this is an invalid URL.');
});