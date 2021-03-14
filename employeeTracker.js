var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require("console.table")

var choices = [
"Add employee", 
"Add role", 
"Add department", 
"View employees", 
"View roles", 
"View departments", 
"Update employee roles",
"Exit"
];


var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: process.env.PORT || 3306,

  // Your username
  user: "root",

  // Your password
  password: "Codysql3!3",
  database: "employee_trackerdb"
});

connection.connect(function(err) {
  if (err) throw err;
  runApp();
});

function runApp() {
  inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: choices
    })
    .then(function(answer) {
      switch (answer.action) {
      case choices[0]/*add employee*/:
        addEmployee();
        break;
      case choices[1]/*add role*/:
        addRole();
        break;
      case choices[2]/*add department*/:
        addDepartment();
        break;
      case choices[3]/*view employee*/:
        viewEmployees();
        break;
      case choices[4]/*view role*/:
        viewRoles();
        break;
      case choices[5]/*view department*/:
        viewDepartments();
        break;
      case choices[6]/*update employee role*/:
        updateEmployeeRole();
        break;
      default:
        process.exit(1);
        break;

      }
    });
}

function addEmployee()
{
  var roles = [];
  var roleTitles = [];
  connection.query("SELECT * FROM role", function(err, result, fields){
    if(err) throw err;
    roles = result;
    result.forEach(role => {
      roleTitles.push(role.title);
    });
  });
  // console.log(roles);
  inquirer
    .prompt(
      [
        {
          type: "input",
          message: "Employee's first name: ",
          name: "firstName",
          validate: validateStrings
        },
        {
          type: "input",
          message: "Employee's last name: ",
          name: "lastName",
          validate: validateStrings
        },
        {
          type: "list",
          message: "Employee's role: ",
          choices: roleTitles,
          name: "role"
        }
      ]
    )
    .then(function(answer) {
      var roleId = 0;
      roles.forEach(role => {
          if(answer.role == role.title)
          {
            roleId = role.id;
          }
      });
      connection.query("INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)", [answer.firstName, answer.lastName, roleId], function(err, result, fields){
        if(err) throw err;
        else{
          console.log("Success! Employee added");
        }
      });
      runApp();
    });
}
function addRole()
{
  // console.log("role");
  var departments = [];
  var departmentTitles = [];
  connection.query("SELECT * FROM department", function(err, result, fields){
    if(err) throw err;
    departments = result;
    result.forEach(department => {
      departmentTitles.push(department.department);
    });

  });
  inquirer
    .prompt([
      {
        type: "input",
        message: "Title of role: ",
        name: "title",
        validate: validateStrings
      },
      {
        type: "input",
        message: "Roles salary: ",
        name: "salary",
        validate: validateNum
      },
      {
        type: "list",
        message: "Department for role: ",
        choices: departmentTitles,
        name: "department"
      }   
    ])
    .then(function(answer) {
        var departmentId = 0;
        departments.forEach(department => {
            if(answer.department == department.department)
            {
              departmentId = department.id;
            }
        });
        // console.log(departmentId);
        connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [answer.title, answer.salary, departmentId], function(err, result, fields){
          if(err) throw err;
          else{
            console.log("Success! Department added");
          }
        });
        runApp();
    });
}
function addDepartment()
{

  inquirer
    .prompt({
        type: "input",
        message: "Name of department: ",
        name: "name",
        validate: validateStrings
    })
    .then(function(answer) {
        connection.query("INSERT INTO department (department) VALUES (?)", [answer.name], function (err, result, fields){
            if(err) throw err;
            else{
                console.log("Success! Department added");
            }
        });
      runApp();
    });
}

function viewEmployees(){
    connection.query('SELECT employee.id, first_name, last_name, manager_id, title, salary, department FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id;', function(err, result, fields){
        console.table(result);
        runApp();
    });
}

function viewRoles(){
    connection.query('SELECT role.id, title, salary, department FROM role INNER JOIN department ON role.department_id = department.id;', function(err, result, fields){
        console.table(result);
        runApp();
    });
}

function viewDepartments(){
    connection.query("SELECT * FROM department", function(err, result, fields){
        console.table(result);
        runApp();
    });
}

function updateEmployeeRole(){
  var employees = [];
  var employeeNames = [];
  connection.query("SELECT * FROM employee", function(err, result, fields){


    if(err) throw err;
    employees = result;
    result.forEach(employee => {
      employeeNames.push(`${employee.first_name} ${employee.last_name}`);
    });
    var roles = [];
    var roleTitles = [];
    connection.query("SELECT * FROM role", function(err, result, fields){
      if(err) throw err;
      roles = result;
      result.forEach(role => {
        roleTitles.push(role.title);
      });
    });
    

    inquirer
      .prompt([
        {
          type: "list",
          message: "Which employee's role should be updated",
          choices: employeeNames,
          name: "employee",
        }
      ]).then(function(answer){
        // console.log(answer);
        var splitName = answer.employee.split(" ");


        inquirer  
          .prompt([
            {
              type: "list",
              message: `What should ${answer.employee}'s new role be`,
              choices: roleTitles,
              name: "newRole"
            }
          ]).then(function(data){
            var roleId = 0;
            roles.forEach(role => {
                if(data.newRole == role.title)
                {
                  roleId = role.id;
                }
            });
            // console.log(roleId);
            connection.query("SELECT * FROM employee WHERE first_name=? AND last_name=?", [splitName[0], splitName[1]], function(err, result, fields){
              // if(err) throw err;
              // console.log(result[0].id);
                connection.query("UPDATE employee SET role_id = ? WHERE id = ?;", [roleId, result[0].id], function(err, result, fields){
                  if(err) throw err;
                  console.log("Success! Role updated");
                  runApp();
                });
            });
          })
      });


  });


}


function validateStrings(input){
  var regex = /^[a-zA-Z ]{2,30}$/;
  return regex.test(input);
}

function validateNum(input){
  return !isNaN(input); //because isNaN returns false if the input is a number we want to return the opposite value so that inquirer receives the proper response for validation
}
