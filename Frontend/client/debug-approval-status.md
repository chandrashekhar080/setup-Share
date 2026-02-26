# Debug Guide: Approval Status Messages

## How to Debug the Issue

1. **Open Browser Developer Tools** (F12)
2. **Go to Console tab**
3. **Navigate to your dashboard** (`/dashboard` or `/user-dashboard`)
4. **Look for these debug messages:**

### Expected Console Output:

```
=== Approval Status Debug ===
userProfile: {id: 1, name: "...", others: "..."}
approvalStatus: {status: "pending", approval_status: "pending"} OR null
isProfileIncomplete: true/false

Checking profile completion for user: {user data}
Profile data: {parsed others data}
```

## Possible Issues & Solutions:

### Issue 1: Profile shows as incomplete when it's actually complete
**Debug messages to look for:**
```
Missing field: fieldName, value: undefined/null/""
Profile incomplete. Missing fields: [array of missing fields]
```

**Solution:** Check which fields are missing and ensure they are properly saved in the `others` field.

### Issue 2: Approval status not loading correctly
**Debug messages to look for:**
```
approvalStatus: null
Profile complete but no approval status - showing not approved message
```

**Solution:** Check if the API call `getUserApprovalStatus()` is working correctly.

### Issue 3: Wrong message showing
**Debug messages to look for:**
```
Approval status details - status: "pending", approval_status: "pending"
Showing pending approval message
```

## Expected Message Flow:

1. **If profile incomplete:** "Complete Your Profile" (Orange)
2. **If profile complete + no approval status:** "You are not Approved by Admin" (Yellow)
3. **If status = 'pending':** "You are not Approved by Admin" (Yellow)
4. **If status = 'rejected':** "Application Rejected" (Red)
5. **If status = 'approved':** "Profile Approved Successfully" (Green)

## Quick Fix Steps:

1. Check console for debug messages
2. Identify which condition is being triggered
3. Verify your profile data in localStorage: `localStorage.getItem("user")`
4. Check if approval status API is returning correct data

## Remove Debug Messages Later:

Once the issue is identified and fixed, remove all `console.log` statements from the `checkProfileCompletion` and `renderApprovalStatus` functions.