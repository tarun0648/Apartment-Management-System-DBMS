const express = require('express');
const router = express.Router();
const cors = require("cors")
const app = express();
router.use(cors());
const db = require('../mysql_connect');
// const pg = require('../postgre_connect')



//values for admin dashboard
router.post("/admin",(req,res)=>
{
  console.log(req.body);
  let resdata;
  let totalowner;
  let totaltenant;
  let totalemployee;
  
  let resul = db.totalowner((err,result)=>
  {
    if(err) console.log(err);
    var resultArray = Object.values(JSON.parse(JSON.stringify(result))[0])[0];
    totalowner = resultArray;
  });
  resul = db.totaltenant((err,result)=>
  {
    if(err) console.log(err);
    var resultArray = Object.values(JSON.parse(JSON.stringify(result))[0])[0];
    totaltenant = resultArray;
  });
  resul = db.totalemployee((err,result)=>
  {
    if(err) console.log(err);
    var resultArray = Object.values(JSON.parse(JSON.stringify(result))[0])[0];
    totalemployee = resultArray;
  });
  resul =db.getdata('tenant',(err,result)=>{
    if(err) console.log(err);
    tenantdata = result;
    resdata = {
      totalowner : totalowner,
      totaltenant: totaltenant,
      totalemployee: totalemployee,
    }
    res.send(resdata);
  })

})



//values for owner dashboard
router.post("/owner",(req,res)=>
{
    let resdata;
  let totalemployee;

  resul = db.totalemployee((err,result)=>
  {
    if(err) console.log(err);
    let resultArray = Object.values(JSON.parse(JSON.stringify(result))[0])[0];
    totalemployee = resultArray;
    resdata = {
      totalemployee : totalemployee
    }
    res.send(resdata);
  })
})


//values for 
router.post("/employee",(req,res)=>
{
    let totalcomplaint;
    const empid = req.body.userId;
    let sal;
    resul = db.empsalary(empid,(err,result)=>
    {
      if(err) console.log(err);
      let resultArray = Object.values(JSON.parse(JSON.stringify(result))[0])[0];
      sal = resultArray;
    })
    resdata = {
      salary : sal
    };
    res.send(resdata);
})

router.post("/tenant",(req,res)=>
{
  const username = req.body.userId;
  const rest = db.gettenantdata(username,(err,result)=>
  {
    if(err) console.log(err);
    res.send(result);
})

});

// Route to handle complaint registration
router.post("/raisingcomplaint", (req, res) => {
    console.log("Received complaint:", req.body);
    const values = [
        req.body.complaint,
        req.body.userId,
        req.body.block,
        req.body.room
    ];
    
    db.registercomplaint(values, (err, result) => {
        if (err) {
            console.error("Error registering complaint:", err);
            res.status(500).send(err);
            return;
        }
        console.log("Complaint registered successfully");
        res.send(result);
    });
});

// Route to view all complaints (Admin view)
router.get("/viewcomplaints", (req, res) => {
    console.log("Fetching all complaints for admin view");
    db.viewcomplaints((err, result) => {
        if (err) {
            console.error("Error fetching complaints:", err);
            res.status(500).send(err);
            return;
        }
        console.log(`Found ${result?.length || 0} complaints`);
        res.send(result || []);
    });
});

// Route to view owner's complaints
router.post("/ownercomplaints", (req, res) => {
    console.log("Fetching complaints for owner:", req.body.userId);
    db.ownercomplaints(req.body.userId, (err, result) => {
        if (err) {
            console.error("Error fetching owner complaints:", err);
            res.status(500).send(err);
            return;
        }
        console.log(`Found ${result?.length || 0} complaints for owner`);
        res.send(result || []);
    });
});

// Update parking slot
router.post("/updateParkingSlot", (req, res) => {
    const { roomNo, parkingSlot } = req.body;
    console.log("Updating parking slot:", { roomNo, parkingSlot });
    
    db.bookslot([parkingSlot, roomNo], (err, result) => {
        if (err) {
            console.error("Error updating parking slot:", err);
            res.status(500).json({ 
                error: "Failed to update parking slot", 
                details: err.message 
            });
            return;
        }
        res.json({ 
            success: true, 
            message: "Parking slot updated successfully" 
        });
    });
});

module.exports = router;