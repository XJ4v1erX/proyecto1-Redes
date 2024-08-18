const net = require("net");
const cliente = new net.Socket();
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
async function login(username, password) {

    const xmpp = client({
        service: "xmpp://alumchat.lol:5222",
        domain: "alumchat.lol",
        username: username,
        password: password,
        terminal: true,
        tls: {rejectUnauthorized: false,},
    });
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


}
// Register
function register() {
    cliente.connect(5222, 'alumchat.lol', function() {
        cliente.write("<stream:stream to='alumchat.lol' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' version='1.0'>");
    });
  
    // ask for username and password
    rl.question("User: ", (username) => {
      rl.question("Pasword: ", (password) => {
        cliente.on('data', function(data) {
            if (data.toString().includes('<stream:features>')) {
                // Enviar consulta de registro
                const xmlRegister = `
                <iq type="set" id="reg_1" mechanism='PLAIN'>
                  <query xmlns="jabber:iq:register">
                    <username>${username}</username>
                    <password>${password}</password>
                  </query>
                </iq>
                `;
                cliente.write(xmlRegister);
            } else if (data.toString().includes('<iq type="result"')) {
                // Successfull register
                console.log('User registered successfully');
                showMenu();
            } else if (data.toString().includes('<iq type="error"')) {
                // Error at register
                console.log('Error at register', data.toString());
            }
        });
      });
    });
  
  
    cliente.on('close', function() {
        console.log('Conection closed');
    });
  }


// call initial menu
showMenu();