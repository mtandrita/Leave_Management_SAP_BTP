using { managed } from '@sap/cds/common';
namespace db;
entity Employees {
  key id : UUID;

  empID : String;
  Name : String;
  email : String;
  phone : String;
  Department : String;
  //LeaveRequests : Association to many LeaveRequest on LeaveRequests.employee = $self;
  priority : Integer;
  casualBalance : Decimal(5,1) default 18;
  sickBalance   : Decimal(5,1) default 7;
  paidLeaveBalance : Decimal(5,1) default 12;
}
entity LeaveType{
    key id : UUID;
    name : String;
    maxPerYear : Decimal(5,2);
    isAdminOnly : Boolean default false;
}

entity LeaveRequest : managed{
    key id : UUID;

    employeeName : String;
    leaveType    : String;

    startDate : Date;
    endDate   : Date;

    status : String;
    reason : String;

    createdAt : Timestamp;

    isHalfDay : Boolean default false;
    halfDayPeriod : String;

    attachments : Composition of many LeaveAttachment
                  on attachments.leave = $self;
}

entity Notification {

    key id : UUID;

    employeeName : String;

    message : String(500);

    createdAt : Timestamp;

    isRead : Boolean default false;
}

entity LeaveAttachment {

    key id : UUID;

    @Core.MediaType : mimeType
    content : LargeBinary;

    @Core.IsMediaType : true
    mimeType : String;

    fileName : String;

    size : Integer;

    downloadUrl : String;

    leave : Association to one LeaveRequest;
}

entity AdminNotification {

    key id : UUID;

    employeeName : String;

    message : String(500);

    createdAt : Timestamp;

    

    isRead : Boolean default false;
}