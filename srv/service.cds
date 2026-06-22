using db from '../db/schema';

service LeaveService {

    entity Employees as projection on db.Employees;

    entity LeaveType as projection on db.LeaveType;

    entity LeaveRequest as projection on db.LeaveRequest;
    
    entity LeaveAttachment
    as projection on db.LeaveAttachment;

    entity Notification as projection on db.Notification;
    entity AdminNotification
    as projection on db.AdminNotification;

    action approveLeave(ID : UUID);
    action rejectLeave(ID : UUID);
}