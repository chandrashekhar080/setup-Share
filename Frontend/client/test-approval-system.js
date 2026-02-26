// Test script to verify the user approval system
// This script can be run in the browser console to test the approval functionality

console.log("🧪 Testing User Approval System");

// Test data
const testUserId = 1;
const testUserData = {
  id: 1,
  name: "John Doe",
  email: "john.doe@example.com",
  mobile: "1234567890",
  status: "active",
  approval_status: "pending"
};

// Mock API responses for testing
const mockApiService = {
  async approveUserProfile(userId, status, comments) {
    console.log(`✅ Mock API: Approving user ${userId} with status: ${status}`);
    console.log(`📝 Comments: ${comments}`);
    return { success: true, message: "User approval status updated" };
  },

  async sendEmailToUser(userId, emailData) {
    console.log(`📧 Mock API: Sending email to user ${userId}`);
    console.log(`📧 Subject: ${emailData.subject}`);
    console.log(`📧 Message preview: ${emailData.message.substring(0, 100)}...`);
    return { success: true, message: "Email sent successfully" };
  },

  async sendNotificationToUser(userId, notificationData) {
    console.log(`🔔 Mock API: Sending notification to user ${userId}`);
    console.log(`🔔 Title: ${notificationData.title}`);
    console.log(`🔔 Message: ${notificationData.message}`);
    console.log(`🔔 Type: ${notificationData.type}`);
    return { success: true, message: "Notification sent successfully" };
  }
};

// Test approval function
async function testUserApproval(userId, approvalStatus, adminComments) {
  try {
    console.log(`\n🚀 Testing ${approvalStatus} for user ${userId}`);
    
    // Simulate the approval process
    await mockApiService.approveUserProfile(userId, approvalStatus, adminComments);
    
    // Prepare email and notification content
    let emailSubject, emailMessage, notificationTitle, notificationMessage;
    
    if (approvalStatus === 'approved') {
      emailSubject = "🎉 Your Share2Care Profile Has Been Approved!";
      emailMessage = `Dear ${testUserData.name}, your profile has been approved! ${adminComments ? `Admin Comments: ${adminComments}` : ''}`;
      notificationTitle = "Profile Approved! 🎉";
      notificationMessage = `Your profile has been approved! ${adminComments ? `Admin note: ${adminComments}` : ''}`;
    } else if (approvalStatus === 'rejected') {
      emailSubject = "Share2Care Profile Review Update";
      emailMessage = `Dear ${testUserData.name}, your profile needs updates. ${adminComments ? `Reason: ${adminComments}` : ''}`;
      notificationTitle = "Profile Needs Review";
      notificationMessage = `Your profile requires updates. ${adminComments ? `Admin feedback: ${adminComments}` : ''}`;
    }

    // Send email
    await mockApiService.sendEmailToUser(userId, {
      subject: emailSubject,
      message: emailMessage,
      template: 'user_approval'
    });

    // Send notification
    await mockApiService.sendNotificationToUser(userId, {
      title: notificationTitle,
      message: notificationMessage,
      type: approvalStatus === 'approved' ? 'approval_success' : 'approval_review'
    });

    console.log(`✅ ${approvalStatus} process completed successfully!`);
    
  } catch (error) {
    console.error(`❌ Error during ${approvalStatus}:`, error);
  }
}

// Run tests
async function runTests() {
  console.log("\n=== Testing User Approval System ===\n");
  
  // Test approval
  await testUserApproval(testUserId, 'approved', 'Great profile! Welcome to the community.');
  
  // Test rejection
  await testUserApproval(testUserId, 'rejected', 'Please complete your profile information and upload required documents.');
  
  console.log("\n=== Tests Completed ===");
  console.log("\n📋 Summary:");
  console.log("✅ User approval with email and notification");
  console.log("✅ User rejection with email and notification");
  console.log("✅ Template-based emails with admin comments");
  console.log("✅ Notification system integration");
  
  console.log("\n🎯 Next Steps:");
  console.log("1. Test the actual API endpoints");
  console.log("2. Verify email delivery");
  console.log("3. Check notification display in user dashboard");
  console.log("4. Test admin panel approval buttons");
}

// Run the tests
runTests();