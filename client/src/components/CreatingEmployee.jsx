import React, { useRef, useState } from "react";
import axios from "axios";

function CreatingEmployee() {
  const nameEl = useRef(null);
  const ageEl = useRef(null);
  const salaryEl = useRef(null);
  const typeEl = useRef(null);
  const blockEl = useRef(null);
  const empIdEl = useRef(null);
  const passEl = useRef(null);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [salary, setSalary] = useState("");
  const [empType, setEmpType] = useState("");
  const [blockNo, setBlockNo] = useState("");
  const [empId, setEmpId] = useState("");
  const [pass, setPass] = useState("");

  const createEmployee = async () => {
    try {
      const res = await axios.post("http://localhost:5000/createemployee", {
        name: name,
        age: age,
        salary: salary,
        empType: empType,
        blockNo: blockNo,
        empId: empId,
        password: pass,
      });
      if (res.status === 200) {
        nameEl.current.value = "";
        ageEl.current.value = "";
        salaryEl.current.value = "";
        typeEl.current.value = "";
        blockEl.current.value = "";
        empIdEl.current.value = "";
        passEl.current.value = "";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const submitHandler = function (e) {
    e.preventDefault();
    createEmployee();
  };

  return (
    <div className="mx-auto w-full max-w-[550px]">
      <form onSubmit={submitHandler} action="" method="POST">
        <div className="mb-5">
          <label
            htmlFor="name"
            className="mb-3 block text-base font-medium text-[#07074D]"
          >
            Employee Name
          </label>
          <input
            type="text"
            ref={nameEl}
            name="name"
            id="name"
            value={name}
            placeholder="Full Name"
            onChange={() => {
              setName(nameEl.current.value);
            }}
            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="empId"
            className="mb-3 block text-base font-medium text-[#07074D]"
          >
            Employee ID
          </label>
          <input
            type="text"
            ref={empIdEl}
            name="empId"
            id="empId"
            value={empId}
            placeholder="Employee ID"
            onChange={() => {
              setEmpId(empIdEl.current.value);
            }}
            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="age"
            className="mb-3 block text-base font-medium text-[#07074D]"
          >
            Age
          </label>
          <input
            type="number"
            name="age"
            ref={ageEl}
            id="age"
            value={age}
            onChange={() => {
              setAge(ageEl.current.value);
            }}
            placeholder="Age"
            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="salary"
            className="mb-3 block text-base font-medium text-[#07074D]"
          >
            Salary
          </label>
          <input
            type="number"
            name="salary"
            ref={salaryEl}
            value={salary}
            onChange={() => {
              setSalary(salaryEl.current.value);
            }}
            id="salary"
            placeholder="Enter Salary"
            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="type"
            className="mb-3 block text-base font-medium text-[#07074D]"
          >
            Employee Type
          </label>
          <input
            type="text"
            name="type"
            ref={typeEl}
            value={empType}
            onChange={() => {
              setEmpType(typeEl.current.value);
            }}
            id="type"
            placeholder="Enter Employee Type"
            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="blockNo"
            className="mb-3 block text-base font-medium text-[#07074D]"
          >
            Block Number
          </label>
          <input
            type="number"
            name="blockNo"
            ref={blockEl}
            value={blockNo}
            onChange={() => {
              setBlockNo(blockEl.current.value);
            }}
            id="blockNo"
            placeholder="Enter Block Number"
            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="pass"
            className="mb-3 block text-base font-medium text-[#07074D]"
          >
            Password
          </label>
          <input
            type="password"
            name="pass"
            ref={passEl}
            value={pass}
            onChange={() => {
              setPass(passEl.current.value);
            }}
            id="pass"
            placeholder="Enter Password"
            className="w-full rounded-md border border-[#e0e0e0] bg-white py-3 px-6 text-base font-medium text-[#6B7280] outline-none focus:border-[#6A64F1] focus:shadow-md"
          />
        </div>

        <div className="flex w-full">
          <button className="mx-auto hover:shadow-form py-3 px-8 text-white bg-blue-500 rounded-md focus:bg-blue-600 focus:outline-none hover:bg-white hover:text-blue-500 transition-all duration-300 hover:border-blue-500 border-transparent border-2">
            Create Employee
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreatingEmployee;
