import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import Aside from "./components/Aside";
import Auth from "./components/Auth";
import OwnerDetails from "./components/OwnerDetails";
import TenantDetails from "./components/TenantDetails";
import CreatingOwner from "./components/CreatingOwner";
import CreatingParkingSlot from "./components/CreatingParkingSlot";
import CreatingEmployee from "./components/CreatingEmployee";
import ComplaintsViewer from "./components/ComplaintsViewer";
import CommunityEvents from "./components/CommunityEvents";
import Amenities from "./components/Amenities";
import ServiceProviders from "./components/ServiceProviders";
import RaisingComplaints from "./components/RaisingComplaints";
import ParkingSlot from "./components/ParkingSlot";
import PayMaintenance from "./components/PayMaintenance";
import CreatingTenant from "./components/CreatingTenant";
import RoomDetails from "./components/RoomDetails";
import ErrorPage from "./ErrorPage";
import ComplaintsViewerOwner from "./components/ComplaintsViewerOwner";
import RoomDetailsOwner from "./components/RoomDetailsOwner";
import Maintenance from "./components/Maintenance";
import Feedback from "./components/Feedback";
import LeaseAgreements from "./components/LeaseAgreements";
import Visitors from "./components/Visitors";


function App() {
  // Sidebar configurations
const forAdmin = [
  "Tenant Details",
  "Owner Details",
  "Create owner",
  "Create employee",
  "Allotting Parking slot",
  "Complaints",
  "Maintenance",
  "Feedback",
  "Community Events",
  "Amenities",
  "Service Providers",
  "Lease Agreements",
  "Visitors"
];

// Employee sidebar (already has Visitors)
const forEmployee = [
  "Complaints",
  "Maintenance",
  "Community Events",
  "Amenities",
  "Service Providers",
  "Visitors"
];

// Tenant sidebar - ADD "Visitors" HERE
const forTenant = [
  "Raising Complaints",
  "Alloted Parking slot",
  "Pay maintenance",
  "Maintenance",
  "Feedback",
  "Community Events",
  "Amenities",
  "Service Providers",
  "Lease Agreements",
  "Visitors"  // ← ADD THIS LINE
];

// Owner sidebar - ADD "Visitors" HERE
const forOwner = [
  "Tenant details",
  "View Complaints",
  "Raise Complaint",
  "Create Tenant",
  "Room Details",
  "Maintenance",
  "Feedback",
  "Community Events",
  "Amenities",
  "Service Providers",
  "Lease Agreements",
  "Visitors"  // ← ADD THIS LINE
];

  return (
    <div className="App font-mons bg-white">
      <Routes>
        <Route path="/" element={<Auth />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <main>
              <Header forHam={[...forAdmin, "Logout"]} />
              <section className="flex">
                <Aside forHam={forAdmin} />
                <Dashboard />
              </section>
            </main>
          }
        />
        <Route
          path="/admin/ownerdetails"
          element={
            <main>
              <Header forHam={forAdmin} />
              <section className="p-5">
                <OwnerDetails />
              </section>
            </main>
          }
        />
        <Route
          path="/admin/tenantdetails"
          element={
            <main>
              <Header forHam={forAdmin} />
              <section className="p-5">
                <TenantDetails />
              </section>
            </main>
          }
        />
        <Route
          path="/admin/createowner"
          element={
            <main>
              <Header forHam={forAdmin} />
              <section className="p-5">
                <CreatingOwner />
              </section>
            </main>
          }
        />
        <Route
          path="/admin/createemployee"
          element={
            <main>
              <Header forHam={forAdmin} />
              <section className="p-5">
                <CreatingEmployee />
              </section>
            </main>
          }
        />
        <Route
          path="/admin/allottingparkingslot"
          element={
            <main>
              <Header forHam={forAdmin} />
              <section className="p-5">
                <CreatingParkingSlot />
              </section>
            </main>
          }
        />
        <Route
          path="/admin/complaints"
          element={
            <main>
              <Header forHam={forAdmin} />
              <section className="p-5">
                <ComplaintsViewer />
              </section>
            </main>
          }
        />
        <Route
          path="/admin/maintenance"
          element={
            <main>
              <Header forHam={forAdmin} />
              <section className="p-5">
                <Maintenance />
              </section>
            </main>
          }
        />
        <Route
          path="/admin/feedback"
          element={
            <main>
              <Header forHam={forAdmin} />
              <section className="p-5">
                <Feedback />
              </section>
            </main>
          }
        />
        <Route
          path="/admin/communityevents"
          element={
            <main>
              <Header forHam={forAdmin} />
              <section className="p-5">
                <CommunityEvents />
              </section>
            </main>
          }
        />
        <Route
          path="/admin/amenities"
          element={
            <main>
              <Header forHam={forAdmin} />
              <section className="p-5">
                <Amenities />
              </section>
            </main>
          }
        />
        <Route
          path="/admin/serviceproviders"
          element={
            <main>
              <Header forHam={forAdmin} />
              <section className="p-5">
                <ServiceProviders />
              </section>
            </main>
          }
        />

        {/* Employee Routes */}
        <Route
          path="/employee"
          element={
            <main>
              <Header forHam={[...forEmployee, "Logout"]} />
              <section className="flex">
                <Aside forHam={forEmployee} />
                <Dashboard />
              </section>
            </main>
          }
        />
        <Route
          path="/employee/complaints"
          element={
            <main>
              <Header forHam={forEmployee} />
              <section className="p-5">
                <ComplaintsViewer />
              </section>
            </main>
          }
        />
        <Route
          path="/employee/maintenance"
          element={
            <main>
              <Header forHam={forEmployee} />
              <section className="p-5">
                <Maintenance />
              </section>
            </main>
          }
        />
        <Route
          path="/employee/communityevents"
          element={
            <main>
              <Header forHam={forEmployee} />
              <section className="p-5">
                <CommunityEvents />
              </section>
            </main>
          }
        />
        <Route
          path="/employee/amenities"
          element={
            <main>
              <Header forHam={forEmployee} />
              <section className="p-5">
                <Amenities />
              </section>
            </main>
          }
        />
        <Route
          path="/employee/serviceproviders"
          element={
            <main>
              <Header forHam={forEmployee} />
              <section className="p-5">
                <ServiceProviders />
              </section>
            </main>
          }
        />

        {/* Tenant Routes */}
        <Route
          path="/tenant"
          element={
            <main>
              <Header forHam={[...forTenant, "Logout"]} />
              <section className="flex">
                <Aside forHam={forTenant} />
                <Dashboard />
              </section>
            </main>
          }
        />
        <Route
          path="/tenant/raisingcomplaints"
          element={
            <main>
              <Header forHam={forTenant} />
              <section className="p-5">
                <RaisingComplaints />
              </section>
            </main>
          }
        />
        <Route
          path="/tenant/allotedparkingslot"
          element={
            <main>
              <Header forHam={forTenant} />
              <section className="p-5">
                <ParkingSlot />
              </section>
            </main>
          }
        />
        <Route
          path="/tenant/paymaintenance"
          element={
            <main>
              <Header forHam={forTenant} />
              <section className="p-5">
                <PayMaintenance />
              </section>
            </main>
          }
        />
        <Route
          path="/tenant/maintenance"
          element={
            <main>
              <Header forHam={forTenant} />
              <section className="p-5">
                <Maintenance />
              </section>
            </main>
          }
        />
        <Route
          path="/tenant/feedback"
          element={
            <main>
              <Header forHam={forTenant} />
              <section className="p-5">
                <Feedback />
              </section>
            </main>
          }
        />
        <Route
          path="/tenant/communityevents"
          element={
            <main>
              <Header forHam={forTenant} />
              <section className="p-5">
                <CommunityEvents />
              </section>
            </main>
          }
        />
        <Route
          path="/tenant/amenities"
          element={
            <main>
              <Header forHam={forTenant} />
              <section className="p-5">
                <Amenities />
              </section>
            </main>
          }
        />
        <Route
          path="/tenant/serviceproviders"
          element={
            <main>
              <Header forHam={forTenant} />
              <section className="p-5">
                <ServiceProviders />
              </section>
            </main>
          }
        />

        {/* Owner Routes */}
        <Route
          path="/owner"
          element={
            <main>
              <Header forHam={[...forOwner, "Logout"]} />
              <section className="flex">
                <Aside forHam={forOwner} />
                <Dashboard />
              </section>
            </main>
          }
        />
        <Route
          path="/owner/tenantdetails"
          element={
            <main>
              <Header forHam={forOwner} />
              <section className="p-5">
                <RoomDetailsOwner />
              </section>
            </main>
          }
        />
        <Route
          path="/owner/viewcomplaints"
          element={
            <main>
              <Header forHam={forOwner} />
              <section className="p-5">
                <ComplaintsViewerOwner />
              </section>
            </main>
          }
        />
        <Route
          path="/owner/raisecomplaint"
          element={
            <main>
              <Header forHam={forOwner} />
              <section className="p-5">
                <RaisingComplaints />
              </section>
            </main>
          }
        />
        <Route
          path="/owner/createtenant"
          element={
            <main>
              <Header forHam={forOwner} />
              <section className="p-5">
                <CreatingTenant />
              </section>
            </main>
          }
        />
        <Route
          path="/owner/roomdetails"
          element={
            <main>
              <Header forHam={forOwner} />
              <section className="p-5">
                <RoomDetails />
              </section>
            </main>
          }
        />
        <Route
          path="/owner/maintenance"
          element={
            <main>
              <Header forHam={forOwner} />
              <section className="p-5">
                <Maintenance />
              </section>
            </main>
          }
        />
        <Route
          path="/owner/feedback"
          element={
            <main>
              <Header forHam={forOwner} />
              <section className="p-5">
                <Feedback />
              </section>
            </main>
          }
        />
        <Route
          path="/owner/communityevents"
          element={
            <main>
              <Header forHam={forOwner} />
              <section className="p-5">
                <CommunityEvents />
              </section>
            </main>
          }
        />
        <Route
          path="/owner/amenities"
          element={
            <main>
              <Header forHam={forOwner} />
              <section className="p-5">
                <Amenities />
              </section>
            </main>
          }
        />
        <Route
          path="/owner/serviceproviders"
          element={
            <main>
              <Header forHam={forOwner} />
              <section className="p-5">
                <ServiceProviders />
              </section>
            </main>
          }
        />

        {/* Error Route */}
        <Route
          path="/*"
          element={
            <main>
              <ErrorPage />
            </main>
          }
        />
        <Route
  path="/admin/leaseagreements"
  element={
    <main>
      <Header forHam={forAdmin} />
      <section className="p-5">
        <LeaseAgreements />
      </section>
    </main>
  }
/>
<Route
  path="/admin/visitors"
  element={
    <main>
      <Header forHam={forAdmin} />
      <section className="p-5">
        <Visitors />
      </section>
    </main>
  }
/>

// ============= EMPLOYEE ROUTES - ADD THIS =============
<Route
  path="/employee/visitors"
  element={
    <main>
      <Header forHam={forEmployee} />
      <section className="p-5">
        <Visitors />
      </section>
    </main>
  }
/>

// ============= TENANT ROUTES - ADD THIS =============
<Route
  path="/tenant/leaseagreements"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <LeaseAgreements />
      </section>
    </main>
  }
/>

// ============= OWNER ROUTES - ADD THIS =============
<Route
  path="/owner/leaseagreements"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <LeaseAgreements />
      </section>
    </main>
  }
/>
<Route
  path="/tenant/visitors"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <Visitors />
      </section>
    </main>
  }
/>

// OWNER ROUTES - Add this route
<Route
  path="/owner/visitors"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <Visitors />
      </section>
    </main>
  }
/>

// ============================================
// COMPLETE TENANT ROUTES SECTION
// ============================================
{/* Tenant Routes */}
<Route
  path="/tenant"
  element={
    <main>
      <Header forHam={[...forTenant, "Logout"]} />
      <section className="flex">
        <Aside forHam={forTenant} />
        <Dashboard />
      </section>
    </main>
  }
/>
<Route
  path="/tenant/raisingcomplaints"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <RaisingComplaints />
      </section>
    </main>
  }
/>
<Route
  path="/tenant/allotedparkingslot"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <ParkingSlot />
      </section>
    </main>
  }
/>
<Route
  path="/tenant/paymaintenance"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <PayMaintenance />
      </section>
    </main>
  }
/>
<Route
  path="/tenant/maintenance"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <Maintenance />
      </section>
    </main>
  }
/>
<Route
  path="/tenant/feedback"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <Feedback />
      </section>
    </main>
  }
/>
<Route
  path="/tenant/communityevents"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <CommunityEvents />
      </section>
    </main>
  }
/>
<Route
  path="/tenant/amenities"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <Amenities />
      </section>
    </main>
  }
/>
<Route
  path="/tenant/serviceproviders"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <ServiceProviders />
      </section>
    </main>
  }
/>
<Route
  path="/tenant/leaseagreements"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <LeaseAgreements />
      </section>
    </main>
  }
/>
<Route
  path="/tenant/visitors"
  element={
    <main>
      <Header forHam={forTenant} />
      <section className="p-5">
        <Visitors />
      </section>
    </main>
  }
/>

// ============================================
// COMPLETE OWNER ROUTES SECTION
// ============================================
{/* Owner Routes */}
<Route
  path="/owner"
  element={
    <main>
      <Header forHam={[...forOwner, "Logout"]} />
      <section className="flex">
        <Aside forHam={forOwner} />
        <Dashboard />
      </section>
    </main>
  }
/>
<Route
  path="/owner/tenantdetails"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <TenantDetails />
      </section>
    </main>
  }
/>
<Route
  path="/owner/viewcomplaints"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <ComplaintsViewerOwner />
      </section>
    </main>
  }
/>
<Route
  path="/owner/raisecomplaint"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <RaisingComplaints />
      </section>
    </main>
  }
/>
<Route
  path="/owner/createtenant"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <CreatingTenant />
      </section>
    </main>
  }
/>
<Route
  path="/owner/roomdetails"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <RoomDetails />
      </section>
    </main>
  }
/>
<Route
  path="/owner/maintenance"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <Maintenance />
      </section>
    </main>
  }
/>
<Route
  path="/owner/feedback"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <Feedback />
      </section>
    </main>
  }
/>
<Route
  path="/owner/communityevents"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <CommunityEvents />
      </section>
    </main>
  }
/>
<Route
  path="/owner/amenities"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <Amenities />
      </section>
    </main>
  }
/>
<Route
  path="/owner/serviceproviders"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <ServiceProviders />
      </section>
    </main>
  }
/>
<Route
  path="/owner/leaseagreements"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <LeaseAgreements />
      </section>
    </main>
  }
/>
<Route
  path="/owner/visitors"
  element={
    <main>
      <Header forHam={forOwner} />
      <section className="p-5">
        <Visitors />
      </section>
    </main>
  }
/>
      </Routes>
    </div>
  );
}

export default App;