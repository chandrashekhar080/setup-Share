// Test file to demonstrate the approval and KYC verification messages
// This file shows the different scenarios that will trigger the messages

console.log("=== Approval and KYC Verification Messages Test ===");

// Scenario 1: User with incomplete profile
const incompleteProfileUser = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  others: JSON.stringify({
    title: "Mr",
    firstName: "John",
    lastName: "Doe",
    // Missing required fields like gender, dob, documents, etc.
  })
};

// Scenario 2: User with no approval status
const noApprovalStatusUser = {
  id: 2,
  name: "Jane Smith",
  email: "jane@example.com",
  others: JSON.stringify({
    title: "Ms",
    firstName: "Jane",
    lastName: "Smith",
    gender: "female",
    dob: "1990-01-01",
    houseNo: "123",
    locality: "Main Street",
    city: "New York",
    pinCode: "10001",
    education: "Bachelor's",
    profession: "Teacher",
    bloodGroup: "O+",
    doc1Type: "Aadhar",
    doc1Number: "123456789012",
    doc1File: "aadhar.pdf",
    doc2Type: "PAN",
    doc2Number: "ABCDE1234F",
    doc2File: "pan.pdf",
    emergencyName: "Emergency Contact",
    emergencyRelation: "Spouse",
    emergencyContact: "9876543210",
    selectedSkills: ["Teaching", "Counseling"]
  })
};

// Scenario 3: User with pending approval
const pendingApprovalStatus = {
  status: 'pending',
  approval_status: 'pending',
  submission_date: '2024-01-15T10:00:00Z'
};

// Scenario 4: User with rejected approval
const rejectedApprovalStatus = {
  status: 'rejected',
  approval_status: 'rejected',
  admin_comments: 'Please provide clearer document images and update your emergency contact information.'
};

// Scenario 5: User with approved status
const approvedApprovalStatus = {
  status: 'approved',
  approval_status: 'approved'
};

console.log("\n1. Incomplete Profile User:");
console.log("   Title: 'Complete Your Profile'");
console.log("   Message: 'Fill your full details, verify your KYC and for approval your account. Please complete your profile to access all features.'");
console.log("   Color: Orange banner");

console.log("\n2. Complete Profile + No Approval Status:");
console.log("   Title: 'You are not Approved by Admin'");
console.log("   Message: 'Admin will review your details in 48 hours'");
console.log("   Color: Yellow banner");

console.log("\n3. Pending Approval:");
console.log("   Title: 'You are not Approved by Admin'");
console.log("   Message: 'Admin will review your details in 48 hours'");
console.log("   Color: Yellow banner");

console.log("\n4. Rejected Approval:");
console.log("   Title: 'Application Rejected'");
console.log("   Message: 'You application rejected by admin apply again and or send us email on contact us section for more details'");
console.log("   Color: Red banner with admin comments");

console.log("\n5. Approved Status:");
console.log("   Title: 'Profile Approved Successfully'");
console.log("   Message: 'Congrats You profile is Approved successfully and now to you have to free to create and join events and all features of our app'");
console.log("   Color: Green banner");

console.log("\n=== Implementation Details ===");
console.log("- Messages appear as banner/alert at top of dashboard");
console.log("- Uses existing UI/UX components (Alert, AlertTitle, AlertDescription)");
console.log("- No design changes, only content updates");
console.log("- Maintains existing functionality");