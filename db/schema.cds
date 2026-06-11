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
}
entity LeaveType{
    key id : UUID;
    name : String;
    maxPerYear : Decimal(5,2);
    isAdminOnly : Boolean default false;
}

entity LeaveRequest {
    key id : UUID;

    employeeName : String;
    leaveType    : String;

    startDate : Date;
    endDate   : Date;

    status : String;
    reason : String;

    isHalfDay : Boolean default false;
    halfDayPeriod : String;
}

entity Notification {

    key id : UUID;

    employeeName : String;

    message : String(500);

    createdAt : Timestamp;

    isRead : Boolean default false;
}