using db from '../db/schema';

service LeaveService {

    entity Employees as projection on db.Employees;

    entity LeaveType as projection on db.LeaveType;

    entity LeaveRequest as projection on db.LeaveRequest;

    entity Notification as projection on db.Notification;

    action approveLeave(ID : UUID);
}