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
    tls: {rejectUnauthorized: false},
  });
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

   xmpp.on("error", (err) => {
    console.error(err);
  });

  xmpp.on("online", async (address) => {
  
    const mainMenu = () => {

    async function unirseASala(nombreSala) {
      console.log("Uniendo a la sala:= ")
    }
    
    async function crearSala(nombreSala) {
      console.log("Creando sala:= ")
    }

    
    async function createGroupChat(roomJid, nickname) {
      console.log("Creando sala de chat grupal...")
    }
    
    
    async function joinGroupChat(roomJid, nickname) {
      console.log("Uniendo a sala de chat grupal...")
    }
    

    async function enviarArchivo(room, filePath) {
      console.log("Enviando archivo...")
    }

    async function saveBase64ToFile(base64Data, filePath) {
      console.log("Guardando archivo...")
    }
    
      const opciones = () => {
        console.log("1. Enseñar todos los usuarios y su estado");
        console.log("2. Agregar un usuario a mis contactos");
        console.log("3. Mostrar detalles de un contacto");
        console.log("4. Comunicación 1 a 1 con cualquier usuario/contacto");
        console.log("5. Participar en conversaciones grupales");
        console.log("6. Definir un mensaje de presencia");
        console.log("7. Centro de notificaciones");
        console.log("8. Eliminar cuenta");
        console.log("9. Cerrar sesión");
      };
      
      opciones()
      


      rl.question("¿Qué opción deseas?: ", async (answer) => {
        switch (answer) {
          case '1':
            console.log("Mostrando todos los usuarios y su estado...");
            
            mainMenu();
            break;

          case "2":
            console.log("Agregando un usuario a tus contactos...");

            break
          // Mostrar detalles de un contacto
          case "3":
            console.log("Mostrando detalles de un contacto...");
            mainMenu()
            break;
          case "4":
            console.log("Comunicándote con un usuario/contacto...");
                    
          case "5":
            console.log("Participando en conversaciones grupales...");
            break;
        
          case "6":
            console.log("Definiendo un mensaje de presencia...");
          
            
          case "7":
            
            console.log("Centro de notificaciones...")
                
            break;

          

          case "8":
           
            console.log("Eliminando cuenta...")
    
          case "9":
          
            console.log("Cerrando sesión...")
        
            break;
          
          default:
            console.log("Opción inválida.")
            mainMenu();
        }
      });
    };
    
    
    mainMenu();
    
    
  });

  xmpp.start().catch(console.error);
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