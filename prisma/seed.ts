import { PrismaClient, Role, AttendanceStatus, Gender, EmploymentStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.ticketComment.deleteMany();
  await prisma.serviceTicket.deleteMany();
  await prisma.timeEntry.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectEmployee.deleteMany();
  await prisma.project.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.journalEntryAccount.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.payrollRecord.deleteMany();
  await prisma.payPeriod.deleteMany();
  await prisma.leave.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.department.deleteMany();
  await prisma.location.deleteMany();
  await prisma.company.deleteMany();
  await prisma.category.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.account.deleteMany();
  await prisma.announcement.deleteMany();

  // Create company
  const company = await prisma.company.create({
    data: {
      name: "PRIME Tech Solutions",
      address: "Tacloban City, Leyte, Philippines",
      phone: "+63 912 345 6789",
      email: "info@prime-tech.com",
      tinNumber: "123-456-789-000",
    },
  });

  console.log("Created company:", company.name);

  // Create locations
  const locations = await Promise.all([
    prisma.location.create({
      data: {
        name: "Main Office",
        type: "OFFICE",
        address: "123 Main St, Tacloban City",
        companyId: company.id,
        latitude: 11.2494,
        longitude: 124.9952,
      },
    }),
    prisma.location.create({
      data: {
        name: "Warehouse",
        type: "WAREHOUSE",
        address: "456 Industrial Ave, Tacloban City",
        companyId: company.id,
        latitude: 11.2510,
        longitude: 124.9970,
      },
    }),
    prisma.location.create({
      data: {
        name: "Site Office - Downtown",
        type: "SITE",
        address: "789 Downtown Plaza, Tacloban City",
        companyId: company.id,
        latitude: 11.2480,
        longitude: 124.9940,
      },
    }),
  ]);

  console.log("Created", locations.length, "locations");

  // Create departments
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: "Engineering",
        code: "ENG",
        locationId: locations[0].id,
        companyId: company.id,
      },
    }),
    prisma.department.create({
      data: {
        name: "Operations",
        code: "OPS",
        locationId: locations[0].id,
        companyId: company.id,
      },
    }),
    prisma.department.create({
      data: {
        name: "Sales & Marketing",
        code: "S&M",
        locationId: locations[0].id,
        companyId: company.id,
      },
    }),
    prisma.department.create({
      data: {
        name: "Finance & Admin",
        code: "FIN",
        locationId: locations[0].id,
        companyId: company.id,
      },
    }),
    prisma.department.create({
      data: {
        name: "HR",
        code: "HR",
        locationId: locations[0].id,
        companyId: company.id,
      },
    }),
  ]);

  console.log("Created", departments.length, "departments");

  // Create users first
  const hashedPassword = await bcrypt.hash("password123", 12);

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@prime-tech.com",
        password: hashedPassword,
        role: Role.SUPER_ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        email: "juan.delacruz@prime-tech.com",
        password: hashedPassword,
        role: Role.MANAGER,
      },
    }),
    prisma.user.create({
      data: {
        email: "maria.reyes@prime-tech.com",
        password: hashedPassword,
        role: Role.HR,
      },
    }),
    prisma.user.create({
      data: {
        email: "jose.santos@prime-tech.com",
        password: hashedPassword,
        role: Role.EMPLOYEE,
      },
    }),
    prisma.user.create({
      data: {
        email: "ana.garcia@prime-tech.com",
        password: hashedPassword,
        role: Role.PAYROLL,
      },
    }),
  ]);

  console.log("Created", users.length, "users");

  // Create employees
  const employees = await Promise.all([
    prisma.employee.create({
      data: {
        employeeNumber: "ADM0001",
        firstName: "Admin",
        lastName: "User",
        gender: Gender.MALE,
        birthDate: new Date("1985-01-15"),
        phone: "+63 912 345 0001",
        email: "admin@prime-tech.com",
        status: EmploymentStatus.REGULAR,
        hireDate: new Date("2020-01-01"),
        departmentId: departments[3].id,
        locationId: locations[0].id,
        position: "System Administrator",
        salary: 50000,
        userId: users[0].id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeNumber: "EMP0001",
        firstName: "Juan",
        lastName: "Dela Cruz",
        middleName: "Santos",
        gender: Gender.MALE,
        birthDate: new Date("1990-05-20"),
        phone: "+63 912 345 0002",
        email: "juan.delacruz@prime-tech.com",
        sssNumber: "12-3456789-0",
        philhealthNumber: "12-3456789012",
        pagibigNumber: "123456789012",
        tinNumber: "123-456-789-001",
        status: EmploymentStatus.REGULAR,
        hireDate: new Date("2021-03-15"),
        regularizedDate: new Date("2021-06-15"),
        departmentId: departments[0].id,
        locationId: locations[0].id,
        position: "Senior CCTV Technician",
        salary: 35000,
        userId: users[1].id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeNumber: "EMP0002",
        firstName: "Maria",
        lastName: "Reyes",
        middleName: "Cruz",
        gender: Gender.FEMALE,
        birthDate: new Date("1992-08-10"),
        phone: "+63 912 345 0003",
        email: "maria.reyes@prime-tech.com",
        status: EmploymentStatus.REGULAR,
        hireDate: new Date("2021-06-01"),
        regularizedDate: new Date("2021-09-01"),
        departmentId: departments[0].id,
        locationId: locations[0].id,
        position: "Network Engineer",
        salary: 32000,
        userId: users[2].id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeNumber: "EMP0003",
        firstName: "Jose",
        lastName: "Santos",
        gender: Gender.MALE,
        birthDate: new Date("1995-02-25"),
        phone: "+63 912 345 0004",
        email: "jose.santos@prime-tech.com",
        status: EmploymentStatus.REGULAR,
        hireDate: new Date("2022-01-10"),
        regularizedDate: new Date("2022-04-10"),
        departmentId: departments[1].id,
        locationId: locations[1].id,
        position: "WiFi Installation Technician",
        salary: 28000,
        userId: users[3].id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeNumber: "EMP0004",
        firstName: "Ana",
        lastName: "Garcia",
        middleName: "Lopez",
        gender: Gender.FEMALE,
        birthDate: new Date("1993-11-30"),
        phone: "+63 912 345 0005",
        email: "ana.garcia@prime-tech.com",
        status: EmploymentStatus.REGULAR,
        hireDate: new Date("2022-05-15"),
        regularizedDate: new Date("2022-08-15"),
        departmentId: departments[2].id,
        locationId: locations[0].id,
        position: "Sales Executive",
        salary: 30000,
        userId: users[4].id,
      },
    }),
    prisma.employee.create({
      data: {
        employeeNumber: "EMP0005",
        firstName: "Pedro",
        lastName: "Mendoza",
        gender: Gender.MALE,
        birthDate: new Date("1988-07-12"),
        phone: "+63 912 345 0006",
        email: "pedro.mendoza@prime-tech.com",
        status: EmploymentStatus.REGULAR,
        hireDate: new Date("2020-09-01"),
        regularizedDate: new Date("2020-12-01"),
        departmentId: departments[0].id,
        locationId: locations[2].id,
        position: "Field Supervisor",
        salary: 38000,
      },
    }),
  ]);

  console.log("Created", employees.length, "employees");

  // Create attendance records for August 2026
  const attendanceRecords = [];
  for (let day = 1; day <= 27; day++) {
    for (const employee of employees.slice(1)) {
      const isRestDay = day % 7 === 0 || day % 7 === 6;
      const clockIn = isRestDay
        ? null
        : new Date(`2026-08-${String(day).padStart(2, "0")}T08:00:00`);
      const clockOut = isRestDay
        ? null
        : new Date(`2026-08-${String(day).padStart(2, "0")}T17:00:00`);

      attendanceRecords.push({
        employeeId: employee.id,
        date: new Date(`2026-08-${String(day).padStart(2, "0")}`),
        clockIn,
        clockOut,
        status: isRestDay ? AttendanceStatus.REST_DAY : AttendanceStatus.PRESENT,
        locationId: locations[0].id,
      });
    }
  }

  await prisma.attendance.createMany({ data: attendanceRecords });
  console.log("Created", attendanceRecords.length, "attendance records");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
