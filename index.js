
const readline = require("readline");

// input reader
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// initial menu
function showMenu() {
  console.log("\nMenu");
  console.log("1. Login");
  console.log("2. Register");
  console.log("3. Exit");

  rl.question("Select an option: ", (answer) => {
    switch (answer) {
    
      // Login  
      case "1":       
        rl.question("User: ", (username) => {
          rl.question("Pasword: ", (password) => {
            login(username, password);
        
          })})
        break;

      // Register  
      case "2":
        register();
        break;

      // Exit   
      case "3":
        console.log("Exiting the program...");
        rl.close(); 
        process.exit();

      default:
        console.log("Invalid option. Try again.");
        showMenu();
    }
  });
}


// Login
function login(username, password) {
  console.log("Login");
  showMenu();

}
// Register
function register() {
    console.log("Register");
    showMenu();

}
    


// call initial menu
showMenu();