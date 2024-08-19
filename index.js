const net = require("net");
const cliente = new net.Socket();
const readline = require("readline");
const { client, xml, jid } = require("@xmpp/client");

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
  
  // XMPP client
  const xmpp = client({
    service: "xmpp://alumchat.lol:5222",
    domain: "alumchat.lol",
    username: username,
    password: password,
    terminal: true,
    tls: {rejectUnauthorized: false},
  });

  // Disable TLS
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  // Error handling
  xmpp.on("error", (err) => {
    console.error(err);
  });

  // Connection
  xmpp.on("online", async (address) => {
  
    const presence = xml('presence', { type: 'available' });
    xmpp.send(presence);

    const mainMenu = () => {

      const soliAmi = []

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
        console.log("1. Show all users and their status");
        console.log("2. Add a user to your contacts");
        console.log("3. Show details of a contact");
        console.log("4. Communicate with a user/contact");
        console.log("5. Participate in group conversations");
        console.log("6. Defining a presence message");
        console.log("7. Notification center");
        console.log("8. Delete account");
        console.log("9. Log out");
      };
      
      opciones()
      


      rl.question("Select an option: ", async (answer) => {
        switch (answer) {
          case '1':
            console.log('Showing all users and their status...');

            // Request roster
            const rosterRequest = xml(
              'iq',
              { type: 'get', id: 'roster' },
              xml('query', { xmlns: 'jabber:iq:roster' })
            );

            // Sending roster request
            xmpp.send(rosterRequest).then(() => {
              //console.log('Solicitud de roster enviada correctamente.');
            }).catch((err) => {
              console.error('Error al enviar la solicitud de roster:', err);
            });

            // Handling roster response
            xmpp.on('stanza', (stanza) => {
              if (stanza.is('iq') && stanza.attrs.type === 'result') {
                const query = stanza.getChild('query', 'jabber:iq:roster');
                const contacts = query.getChildren('item');

                // Print contacts
                console.log('Contact list:');
                contacts.forEach((contact) => {
                  const jid = contact.attrs.jid;
                  const name = contact.attrs.name || jid.split('@')[0];
                  const subscription = contact.attrs.subscription;

                  console.log(`- JID: ${jid}, Name: ${name}, Status: ${subscription}`);
                  
                })
                
                xmpp.on('stanza', stanza => {
  
                  // console.log(stanza)
  
                  if (stanza.is('presence')) {
                    const from = stanza.attrs.from;
                    const type = stanza.attrs.type;
                    const show = stanza.getChildText('show');

                    // Si el tipo es undefined, entonces es online.
                    if (type === undefined) {
                      console.log(`Presence from ${from}: type=online`);
                    }else{
                      console.log(`Presence from ${from}: type=${type}, show=${show}`);
                    }

                  }
                });
              }
            });
            
            mainMenu();
            break;

          case "2":

            console.log("1. Add a user to your contacts");
            console.log("2. Accept requests");
            console.log("3. Return to main menu");

            rl.question("Select an option: ", async (answer) => {
              switch (answer) {
                case '1':
                  console.log("Adding a user to your contacts...");
                  rl.question("JID of the user you want to add: ",  (userJID) => {

                    userJID = userJID + "@alumchat.lol"

                    const presence = xml(
                      'presence',
                      { to: userJID, type: 'subscribe' }
                    );
      
                    xmpp.send(presence).then(() => {
                      console.log(`Request sent to: ${userJID}`);
                      mainMenu(); 
                    }).catch((err) => {
                      console.error('Error at sending request:', err);
                      mainMenu(); 
                    });
                  });
                  break;
                case '2':
                  console.log("Accepting requests...");

                  if (soliAmi.length === 0) {
                    console.log("There are no friend requests.");
                  } else {
                    console.log("Friend requests received:", soliAmi);
                  
                    rl.question('Do you want to accept a friend request? (y/n): ', async (answer) => {

                      if (answer.toLowerCase() === 'y') {
                        rl.question('Enter the name of the person you want to accept: ', async (nombrePersona) => {
                          const jidAceptado = `${nombrePersona}@alumchat.lol`;
                  
                          const solicitud = soliAmi.find((solicitud) => solicitud === jidAceptado);

                          console.log("Request found:", solicitud);
                    
                          if (solicitud) {
                            await xmpp.send(xml('presence', { to: solicitud, type: 'subscribed' }));
                            console.log(`Accepted subscription request from: ${solicitud}`);

                            const index = soliAmi.indexOf(solicitud);
                            if (index > -1) {
                              soliAmi.splice(index, 1);
                            }

                          } else {
                            console.log("There is no request from that user.");
                          }
                      })
                    }});
                  }

                  xmpp.on('stanza', async (stanza) => {
                    const fromJid = stanza.attrs.from;
                    
                    if (stanza.is('presence') && stanza.attrs.type === 'subscribe') {
                      // Preguntado si se quiere aceptar o no la solicitud.
                      rl.question(` Do you want to accept the subscription request from ${fromJid}? (y/n): `, async (answer) => {
                        const response = answer.toLowerCase();
                        if (response === 'y') {
                          // Aceptar la solicitud de suscripción
                          await xmpp.send(xml('presence', { to: fromJid, type: 'subscribed' }));
                          console.log(`Friend request accepted from ${fromJid}`);
                          mainMenu()
                        } else {
                          // Rechazar la solicitud de suscripción
                          await xmpp.send(xml('presence', { to: fromJid, type: 'unsubscribed' }));
                          console.log(`Friend request rejected from ${fromJid}`);
                          mainMenu()
                        }
                      }
                    )};
                  });
                  break
                case "3":
                  console.log("Returning to main menu...");
                  mainMenu();
                  break;
                default:
                  console.log("Invalid option.");
                  mainMenu(); 
              }
            });
            break
          
          case "3":
            console.log("Showing contacts details...");
            rl.question("JID of the contact you want to see: ", (contactJID) => {
              const newC = contactJID + "@alumchat.lol";

              const presenceRequest = xml('presence', { to: contactJID });
              xmpp.send(presenceRequest)
              xmpp.on('stanza', (stanza) => {
                if (stanza.is('iq') && stanza.attrs.type === 'result') {
                  const query = stanza.getChild('query', 'jabber:iq:roster');
                  const contacts = query.getChildren('item');
          
                  const contact = contacts.find((contact) => contact.attrs.jid === newC);
          
                  if (contact) {
                    console.log(`Details of the contact ${contactJID}:`);
                    console.log(`- JID: ${contact.attrs.jid}`);
                    console.log(`- Name: ${contact.attrs.name || contact.attrs.jid}`);
                  } else {
                    console.log(`The contact ${contactJID} is not in your contact list.`);
                  }
                }
              });
          
              const rosterRequest = xml(
                'iq',
                { type: 'get', id: 'roster' },
                xml('query', { xmlns: 'jabber:iq:roster' })
              );
          
              // Enviar la solicitud de roster al servidor
              xmpp.send(rosterRequest).then(() => {
                //console.log('Roster request sent successfully.');
              }).catch((err) => {
                console.error('Error sending roster request:', err);
              });
            });

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