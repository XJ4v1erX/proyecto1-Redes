const { client, xml, jid } = require("@xmpp/client");
const debug = require("@xmpp/debug");
const { unsubscribe } = require("diagnostics_channel");
const net = require("net");
const cliente = new net.Socket();
const fetch = require('node-fetch');
const { join } = require("path");
const fs = require('fs')
const EventEmitter = require('events');
const request = require('request')
const readline = require("readline");
const { invite } = require("simple-xmpp");
const { default: messaging } = require("stanza/plugins/messaging");

// Lector del input.
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Menú inicial.
function showMenu() {
  console.log("\nMenú");
  console.log("1. Iniciar sesión");
  console.log("2. Registrarse");
  console.log("3. Salir");

  rl.question("Selecciona una opción: ", (answer) => {
    switch (answer) {
      case "1":
               
        rl.question("Usuario: ", (username) => {
          rl.question("Contraseña: ", (password) => {
            login(username, password);
        
          })})
        break;
      case "2":
        register();
        break;
      case "3":
        console.log("Saliendo...");
        rl.close(); 
        process.exit();
      default:
        console.log("Opción inválida.");
        showMenu();
    }
  });
}

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

    const presence = xml('presence', { type: 'available' });
    xmpp.send(presence);
    
    const mainMenu = () => {

    const MAX_MESSAGE_LENGTH = 50; 
      
    const messages = []; 
    const messagesDictionary = {}

    const soliAmi = [] 
    const gChat = [] 

    xmpp.on('stanza', (stanza) => {

      if (stanza.is('message') && stanza.attrs.type === 'chat') {
        const from = stanza.attrs.from;
        const body = stanza.getChildText('body');

      if (body) {
        

        if (body.length > MAX_MESSAGE_LENGTH) {
          const truncatedBody = body.substring(0, MAX_MESSAGE_LENGTH) + '...';
          console.log(`${from}: ${truncatedBody}`);
          
          
          messages.push(body)

          if (!messagesDictionary[from]) {
            messagesDictionary[from] = [];
          }
          messagesDictionary[from].push(body);


        } else {
          console.log(`${from}: ${body}`);

          
          messages.push(body)

          const fromUser = from.split('@')[0];
          if (!messagesDictionary[fromUser]) {
            messagesDictionary[fromUser] = [];
          }

          messagesDictionary[fromUser].push(body);

         
        
        }
      }
        
    
      }

      if (stanza.is('presence') && stanza.attrs.type === 'subscribe') {
        const from = stanza.attrs.from;
        
        soliAmi.push(from);
        console.log("Solicitud de amistad recibida de: ", from)
      }

      if (stanza.is('message') && stanza.attrs.from.includes('@conference.alumchat.lol')) {

       
        const chatG = stanza.attrs.from

        const to = stanza.attrs.to

        const usernames = to.split('@')[0];
        
        
        gChat.push(chatG)

        
        if (!to.includes('/')) {
          console.log("Invitación a chat grupal recibida de: ", chatG)
        }

      }

    });

    
    function printLastMessage() {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage !== undefined) {
        if (lastMessage.length > MAX_MESSAGE_LENGTH) {
          const truncatedMessage = lastMessage.substring(0, MAX_MESSAGE_LENGTH) + '...';
          console.log(`Último mensaje recibido: ${truncatedMessage}`);
        }
      } else {
        console.log("No se han recibido mensajes.");
      }
    }

    async function unirseASala(nombreSala) {
      const roomJID = jid(`${nombreSala}@conference.alumchat.lol`);
      try {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
    
        rl.on('line', async (message) => {
          if (message.trim() === 'exit') {
           
            rl.close();
          } else {
            
            const messageToSend = xml(
              'message', 
              { type: 'chat', to: roomJID }, 
              xml('body', {}, message)
              );
            await xmpp.send(messageToSend);
          }
        });
    
        
        await xmpp.send(xml('presence', { to: roomJID }));
        console.log(`Te has unido a la sala "${nombreSala}"`);
    
        xmpp.on('stanza', (message) => {
          if (message.is('message') && message.attrs.type === 'chat') {
            const from = message.attrs.from;
            const body = message.getChildText('body');
            if (body) {
              console.log(`${from}: ${body}`);
            }
          }
        });
    
        rl.on('close', () => {
          console.log('Saliendo de la sala...');
          mainMenu(); 
        });
    
        console.log("Puedes escribir mensajes para enviar a la sala. Escribe 'exit' para salir.");
      } catch (error) {
        console.error(`Error al unirse a la sala "${nombreSala}":`, error.message);
      }
    }
    
    
    async function crearSala(nombreSala) {
      const roomJID = jid(`${nombreSala}@conference.alumchat.lol`);
      try {
        await xmpp.send(
          xml('iq', { type: 'set' }, 
            xml('query', { xmlns: 'http://jabber.org/protocol/muc#owner' },
              xml('x', { xmlns: 'jabber:x:data', type: 'submit' },
                xml('field', { var: 'FORM_TYPE' },
                  xml('value', {}, 'http://jabber.org/protocol/muc#roomconfig')
                )
              )
            )
          )
        );
        console.log(`Se ha creado la sala "${nombreSala}" con JID: ${roomJID}`);
        unirseASala(nombreSala);
      } catch (error) {
        console.error(`Error al crear la sala "${nombreSala}":`, error.message);
      }
    }

    
    async function createGroupChat(roomJid, nickname) {
      roomJid = roomJid + "@conference.alumchat.lol";
    
      try {
        await xmpp.send(xml('presence', { to: roomJid + '/' + nickname }));
        console.log('Joined group chat:', roomJid);
    
       
        const rl2 = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
    
        rl2.on('line', async (message) => {
          if (message.trim() === 'exit') {
            // Salir del chat al escribir "exit"
            mainMenu();
            rl2.close();
          } else if (message.trim() === 'invitar') {
            rl2.question('Ingresa el nombre de la persona a la que deseas invitar: ', async (nombrePersona) => {
              // Verificando que el nombre de la persona no sea el mismo que el user del que está invitando.
              if (nombrePersona !== username) {
                const jidInvitado = `${nombrePersona}@alumchat.lol`;
                console.log("Nombre: ", jidInvitado);
      
                // Enviar una invitación al usuario
                const invite = xml(
                  'message',
                  { to: roomJid },
                  xml(
                    'x',
                    { xmlns: 'http://jabber.org/protocol/muc#user' },
                    xml(
                      'invite',
                      { to: jidInvitado },
                      xml('reason', {}, `Join our group: ${roomJid}`)
                    )
                  )
                );
                await xmpp.send(invite);
              }
            });
          } else if (message.trim() === 'archivo') {
            rl2.question("Ingresa la ruta del archivo que deseas enviar: ", async (filePath) => {
              // Enviar el archivo al grupo
              await enviarArchivo(roomJid, filePath);
            });
          } else {
            // Mandando un mensaje al chat.
            const messageT = xml(
              "message",
              { type: "groupchat", to: roomJid },
              xml("body", {}, message),
            );
            await xmpp.send(messageT).catch((err) => { console.warn(err) });
          }
        });
    
        xmpp.on('stanza', async (stanza) => {
          if (stanza.is('message') && stanza.getChild('body')) {
            const { from, body } = stanza;
    
            // Verificando el tipo del body de la stanza.
            if (stanza.attrs.type === "groupchat") {
              // Obteniendo de quien se mandó el mensaje.
              const from = stanza.attrs.from;
              // Obteniendo el cuerpo del mensaje.
              const body = stanza.getChildText("body");
              // Obteniendo el subject del mensaje.
              const subject = stanza.getChildText("subject");
    
              // Si el from, el body y el subject no están vacíos, entonces se imprime el mensaje.
              if (from && body && subject && (subject.includes('Archivo:') || subject.includes('File:'))) {
                console.log(`${from}: Archivo recibido`);
                const fileName = subject.slice(subject.indexOf(':') + 1).trim();
                const base64Data = body.slice(7); // Eliminar "file://"
                const filePath = `./recibidos/${fileName}`; // Cambiar la ruta según tu necesidad
                
                // Convertir base64 a archivo y guardarlo
                await saveBase64ToFile(base64Data, filePath);
                
                console.log(`Archivo recibido de ${from}: ${filePath}`);
              } else if (from && body && (body.includes('Archivo:') || body.includes("File:"))) {
                console.log("Archivo recibido");
                const fileName = body.slice(body.indexOf(':') + 1).trim();
                const base64Data = body.split('\n')[1].slice(7); // Eliminar "file://"
                const filePath = `./recibidos/${fileName}`; // Cambiar la ruta según tu necesidad
            
                // Convertir base64 a archivo y guardarlo
                await saveBase64ToFile(base64Data, filePath);
            
                console.log(`Archivo recibido de ${from}: ${filePath}`);
              } else if (from && body) {
                console.log(`${from}: ${body}`);
              }
            }
          }
        });
      } catch (error) {
        console.error('Error joining group chat:', error.toString());
      }
    }
    
    
    async function joinGroupChat(roomJid, nickname) {
      console.log("Room JID: ", roomJid);
    
      roomJid = roomJid + "@conference.alumchat.lol";
    
      try {
        await xmpp.send(xml('presence', { to: roomJid + '/' + nickname }));
        console.log('Joined group chat:', roomJid);
    
        // Leyendo lo que el usuario ingrese desde el teclado.
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
    
        rl.on('line', async (message) => {
          if (message.trim() === 'exit') {
            // Salir del chat al escribir "exit"
            mainMenu();
            rl.close();
          } else if (message.trim() === 'invitar') {
            rl.question('Ingresa el nombre de la persona a la que deseas invitar: ', async (nombrePersona) => {
              const jidInvitado = `${nombrePersona}@alumchat.lol`;
    
              console.log("Nombre: ", jidInvitado);
    
              // Enviar una invitación al usuario
              const invite = xml(
                'message',
                { to: roomJid },
                xml(
                  'x',
                  { xmlns: 'http://jabber.org/protocol/muc#user' },
                  xml(
                    'invite',
                    { to: jidInvitado },
                    xml('reason', {}, `Join our group: ${roomJid}`)
                  )
                )
              );
              await xmpp.send(invite);
    
              console.log(`Invitación enviada a ${jidInvitado}`);
            });
          } else if (message.trim() === 'archivo') {
            rl.question("Ingresa la ruta del archivo que deseas enviar: ", async (filePath) => {
              // Enviar el archivo al grupo
              await enviarArchivo(roomJid, filePath);
            });
          } else {
            // Mandando un mensaje al chat.
            const messageT = xml(
              "message",
              { type: "groupchat", to: roomJid },
              xml("body", {}, message),
            );
            await xmpp.send(messageT).catch((err) => { console.warn(err) });
          }
        });
    
        xmpp.on('stanza', async (stanza) => {
          if (stanza.is('message') && stanza.getChild('body')) {
            const { from, body } = stanza;
    
            // Verificando el tipo del body de la stanza.
            if (stanza.attrs.type === "groupchat") {
              // Obteniendo de quien se mandó el mensaje.
              const from = stanza.attrs.from;
              // Obteniendo el cuerpo del mensaje.
              const body = stanza.getChildText("body");
              // Obteniendo el subject del mensaje.
              const subject = stanza.getChildText("subject");
    
              // Si el from, el body y el subject no están vacíos, entonces se imprime el mensaje.
              if (from && body && subject && (subject.includes('Archivo:') || subject.includes('File:'))) {
                console.log(`${from}: Archivo recibido`);
                const fileName = subject.slice(subject.indexOf(':') + 1).trim();
                const base64Data = body.slice(7); // Eliminar "file://"
                const filePath = `./recibidos/${fileName}`; // Cambiar la ruta según tu necesidad
                
                // Convertir base64 a archivo y guardarlo
                await saveBase64ToFile(base64Data, filePath);
                
                console.log(`Archivo recibido de ${from}: ${filePath}`);
              } else if (from && body && (body.includes('Archivo:') || body.includes("File:"))) {
                console.log("Archivo recibido");
                const fileName = body.slice(body.indexOf(':') + 1).trim();
                const base64Data = body.split('\n')[1].slice(7); // Eliminar "file://"
                const filePath = `./recibidos/${fileName}`; // Cambiar la ruta según tu necesidad
            
                // Convertir base64 a archivo y guardarlo
                await saveBase64ToFile(base64Data, filePath);
            
                console.log(`Archivo recibido de ${from}: ${filePath}`);
              } else if (from && body) {
                console.log(`${from}: ${body}`);
              }
            }
          }
        });
      } catch (error) {
        console.error('Error joining group chat:', error.toString());
      }
    }

    // Función para convertir archivo a base64
    function fileToBase64(filePath) {
      const fs = require('fs');
      const fileData = fs.readFileSync(filePath);
      const base64Data = fileData.toString('base64');
      return base64Data;
    }
    

    async function enviarArchivo(room, filePath) {
      
      const base64File = fileToBase64(filePath);
      const fileName = filePath.split('/').pop(); 
      const message = xml(
        'message',
        { type: 'groupchat', to: room },
        xml('body', {}, `file://${base64File}`),
        xml('subject', {}, `Archivo: ${fileName}`)
      );
    
      // Enviar el mensaje al contacto
      await xmpp.send(message);
      //console.log('Archivo enviado con éxito. ' + message);
    }

    async function saveBase64ToFile(base64Data, filePath) {
      const fs = require('fs');
      const fileData = Buffer.from(base64Data, 'base64');
      await fs.promises.writeFile(filePath, fileData);
      console.log(`Archivo guardado en: ${filePath}`);
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
            console.log('Mostrando todos los usuarios y su estado...');

            // Solicitar el roster al servidor
            const rosterRequest = xml(
              'iq',
              { type: 'get', id: 'roster' },
              xml('query', { xmlns: 'jabber:iq:roster' })
            );

            // Enviar la solicitud de roster al servidor
            xmpp.send(rosterRequest).then(() => {
              // Imprimiendo la respuesta.
            }).catch((err) => {
              console.error('Error al enviar la solicitud de roster:', err);
            });

            // Manejar la respuesta del roster
            xmpp.on('stanza', (stanza) => {
              if (stanza.is('iq') && stanza.attrs.type === 'result') {
                const query = stanza.getChild('query', 'jabber:iq:roster');
                const contacts = query.getChildren('item');

                // Imprimiendo la lista de contactos.
                console.log('Lista de contactos:');
                contacts.forEach((contact) => {
                  const jid = contact.attrs.jid;
                  const name = contact.attrs.name || jid.split('@')[0];
                  const subscription = contact.attrs.subscription;

                  console.log(`- JID: ${jid}, Nombre: ${name}, Suscripción: ${subscription}`);
                  
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
            console.log("1. Agregar un usuario a mis contactos");
            console.log("2. Aceptar solicitudes");
            console.log("3. Regresar")

            rl.question("¿Qué opción deseas?: ", async (answer) => {
              switch (answer) {
                case '1':
                  console.log("Agregando un usuario a mis contactos...");
                  rl.question("JID del usuario que deseas agregar: ", (userJID) => {

                    // Agregando al userJID el @alumchat.lol
                    userJID = userJID + "@alumchat.lol"

                    // Enviar una solicitud de suscripción al usuario que deseas agregar
                    const presence = xml(
                      'presence',
                      { to: userJID, type: 'subscribe' }
                    );
      
                    xmpp.send(presence).then(() => {
                      console.log(`Solicitud de suscripción enviada a ${userJID}`);
                      mainMenu(); // Vuelve al menú principal después de completar la opción
                    }).catch((err) => {
                      console.error('Error al enviar la solicitud de suscripción:', err);
                      mainMenu(); // Vuelve al menú principal en caso de error
                    });
                  });
                  break;
                case '2':
                  console.log("Aceptando solicitudes...");

                  // Revisando si hay solicitudes en la lista de soliAmi.
                  if (soliAmi.length === 0) {
                    console.log("No hay solicitudes de amistad.")
                  } else {
                    console.log("Solicitudes de amistad recibidas: ", soliAmi);
                  
                    // Preguntar al usuario si desea aceptar alguna solicitud
                    rl.question('¿Quieres aceptar alguna solicitud? (s/n): ', async (answer) => {

                      if (answer.toLowerCase() === 's') {
                        rl.question('Ingresa el nombre de la persona a la que deseas aceptar: ', async (nombrePersona) => {
                          const jidAceptado = `${nombrePersona}@alumchat.lol`;
                          
                          // Buscando la persona en la lista.
                          const solicitud = soliAmi.find((solicitud) => solicitud === jidAceptado);

                          console.log("Solicitud: ", solicitud)
                    
                          if (solicitud) {
                            await xmpp.send(xml('presence', { to: solicitud, type: 'subscribed' }));
                            console.log(`Accepted subscription request from: ${solicitud}`);

                            // Una vez se aceptó a la persona, se quita de la lista de soliAmi.
                            const index = soliAmi.indexOf(solicitud);
                            if (index > -1) {
                              soliAmi.splice(index, 1);
                            }

                          } else {
                            console.log("No se encontró solicitud de amistad para la persona indicada.");
                          }
                      })
                    }});
                  }


                  // Escuchar solicitudes de suscripción (solicitudes de amistad)
                  xmpp.on('stanza', async (stanza) => {
                    const fromJid = stanza.attrs.from;
                    // Verificar que sea una solicitud de suscripción
                    if (stanza.is('presence') && stanza.attrs.type === 'subscribe') {
                      // Preguntado si se quiere aceptar o no la solicitud.
                      rl.question(`¿Deseas aceptar la solicitud de ${fromJid}? (s/n): `, async (answer) => {
                        const response = answer.toLowerCase();
                        if (response === 's') {
                          // Aceptar la solicitud de suscripción
                          await xmpp.send(xml('presence', { to: fromJid, type: 'subscribed' }));
                          console.log(`Solicitud de suscripción aceptada de ${fromJid}`);
                          mainMenu()
                        } else {
                          // Rechazar la solicitud de suscripción
                          await xmpp.send(xml('presence', { to: fromJid, type: 'unsubscribed' }));
                          console.log(`Solicitud de suscripción rechazada de ${fromJid}`);
                          mainMenu()
                        }
                      }
                    )};
                  });
                  break;
                case "3":
                  console.log("Regresando al menú principal...");
                  mainMenu();
                  break;
                default:
                  console.log("Opción inválida.")
                  mainMenu(); // Vuelve al menú principal en caso de opción inválida
              }
            });
            break
          // Mostrar detalles de un contacto
          case "3":
            console.log("Mostrando detalles de un contacto...");
            rl.question("JID del contacto que deseas ver detalles: ", (contactJID) => {
              const newC = contactJID + "@alumchat.lol";

              const presenceRequest = xml('presence', { to: contactJID });
              xmpp.send(presenceRequest);
          
              // Evento para recibir la respuesta del roster del servidor
              xmpp.on('stanza', (stanza) => {
                if (stanza.is('iq') && stanza.attrs.type === 'result') {
                  const query = stanza.getChild('query', 'jabber:iq:roster');
                  const contacts = query.getChildren('item');
          
                  // Buscar el contacto en la lista de contactos (roster)
                  const contact = contacts.find((contact) => contact.attrs.jid === newC);
          
                  if (contact) {
                    console.log(`Detalles del contacto ${contactJID}:`);
                    console.log(`- JID: ${contact.attrs.jid}`);
                    console.log(`- Nombre: ${contact.attrs.name || contact.attrs.jid}`);
                    // Puedes acceder a más detalles del contacto aquí, como el estado de presencia, mensaje personalizado, etc.
                  } else {
                    console.log(`El contacto ${contactJID} no está en tu lista de contactos.`);
                  }
          
                  
                }
              });
          
              // Solicitar el roster al servidor
              const rosterRequest = xml(
                'iq',
                { type: 'get', id: 'roster' },
                xml('query', { xmlns: 'jabber:iq:roster' })
              );
          
              // Enviar la solicitud de roster al servidor
              xmpp.send(rosterRequest).then(() => {
                console.log('Solicitud de roster enviada al servidor.');
              }).catch((err) => {
                console.error('Error al enviar la solicitud de roster:', err);
              });
            });

            mainMenu()
            break;
          case "4":
            console.log("Comunicación 1 a 1 con cualquier usuario/contacto...");
            
            
            // Pidiendo el usuario con el que se quiere chatear.
            rl.question("JID del usuario con el que deseas chatear: ", (userJID) => {
              const newC = userJID + "@alumchat.lol";
              chatWithUser(newC);
            });
            
            async function chatWithUser(userJID) {
              console.log(`Iniciando chat con: ${userJID}`);
            
              
                // Función para manejar los mensajes entrantes del usuario
                function handleIncomingMessages() {
                  xmpp.on('stanza', async (stanza) => {
                    if (stanza.is('message') && stanza.getChild('body')) {
                      const from = stanza.attrs.from;
                      const body = stanza.getChildText('body');
                      const subject = stanza.getChildText('subject');
                  
                      // Verificar si el body no es nulo o indefinido antes de usar includes
                      if (body && (body.includes('Archivo:') || body.includes("File:"))) {
                        console.log("Archivo recibido");
                        const fileName = body.slice(body.indexOf(':') + 1).trim();
                        const base64Data = body.split('\n')[1].slice(7); // Eliminar "file://"
                        const filePath = `./recibidos/${fileName}`; // Cambiar la ruta según tu necesidad
                      
                        // Convertir base64 a archivo y guardarlo
                        await saveBase64ToFile(base64Data, filePath);
                      
                        console.log(`Archivo recibido de ${from}: ${filePath}`);
                      } else if (subject && (subject.includes('Archivo:') || subject.includes('File:'))) {
                        console.log("Archivo recibido");
                        const fileName = subject.slice(subject.indexOf(':') + 1).trim();
                        const base64Data = body.slice(7); // Eliminar "file://"
                        const filePath = `./recibidos/${fileName}`; // Cambiar la ruta según tu necesidad
                      
                        // Convertir base64 a archivo y guardarlo
                        await saveBase64ToFile(base64Data, filePath);
                      
                        console.log(`Archivo recibido de ${from}: ${filePath}`);
                      } else if (body) {
                        console.log(`${from}: ${body}`);
                      }
                    }
                  });
                }
            
              // Comenzar a escuchar mensajes del usuario
              handleIncomingMessages();

              async function saveBase64ToFile(base64Data, filePath) {
                const fs = require('fs');
                const fileData = Buffer.from(base64Data, 'base64');
                await fs.promises.writeFile(filePath, fileData);
                console.log(`Archivo guardado en: ${filePath}`);
              }
            
              // Configurar el manejo de entrada de mensajes desde la consola
              const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
              });
            
              rl.setPrompt('Tú: ');
              rl.prompt();
            
              rl.on('line', async (message) => {
                if (message.trim() === 'exit') {
                  // Salir del chat al escribir "exit"
                  mainMenu();
                  rl.close();
                } else if (message.trim() === 'archivo'){
                  rl.question("Ingresa la ruta del archivo que deseas enviar: ", async (filePath) => {
                    // Enviar el archivo al usuario
                    await enviarArchivoBase64(userJID, filePath);
                    
                    
                    // Función para convertir archivo a base64
                    function fileToBase64(filePath) {
                      const fs = require('fs');
                      const fileData = fs.readFileSync(filePath);
                      const base64Data = fileData.toString('base64');
                      return base64Data;
                    }

                    // Función para enviar un archivo como mensaje en base64
                    async function enviarArchivoBase64(contactJID, filePath) {
                      // const newC = contactJID + '@alumchat.lol';

                      // Leer el archivo y convertirlo a base64
                      const base64File = fileToBase64(filePath);
                      const fileName = filePath.split('/').pop(); // Obtener el nombre del archivo desde la ruta

                      // Crear el mensaje con el archivo en base64
                      const message = xml(
                        'message',
                        { type: 'chat', to: contactJID },
                        xml('body', {}, `file://${base64File}`),
                        xml('subject', {}, `Archivo: ${fileName}`)
                      );

                      await xmpp.send(message);
                      //console.log('Archivo enviado con éxito. ' + message);
                    }

                    });
                }
                else {
                  // Enviando el mensaje al usuario destino
                  const messageToSend = xml(
                    'message',
                    { type: 'chat', to: userJID }, // Usamos el JID del usuario destino
                    xml('body', {}, message),
                  );
                  await xmpp.send(messageToSend);
                }
              });
            
              rl.on('close', () => {
                console.log('Chat finalizado.');
                mainMenu(); // Vuelve al menú principal después de completar la conversación
              });
            }
            
            break;
            
                    
          case "5":
            console.log("Participando en conversaciones grupales...");

            rl.question("¿Deseas unirte a una sala existente o crear una nueva sala? (Unir/Crear): ", (respuesta) => {
              const opcion = respuesta.toLowerCase();
              if (opcion === "unir") {
                rl.question("Ingresa el nombre de la sala a la que deseas unirte: ", (nombreSala) => {

                  console.log("Nombre sala: ", nombreSala)

                  joinGroupChat(nombreSala, username);
                });
              } else if (opcion === "crear") {
                rl.question("Ingresa el nombre de la nueva sala que deseas crear: ", (nombreSala) => {
                  createGroupChat(nombreSala, username);
                });
              } else {
                console.log("Opción no válida. Volviendo al menú principal.");
                mainMenu();
              }
            });


            break;
        
          case "6":
            console.log("Definiendo un mensaje de presencia...");
          
            // Pedir el estado de presencia al usuario
            rl.question("Estado de presencia (ejemplo: 'disponible', 'ocupado', 'no disponible'): ", async (presenceState) => {
              // Pedir el mensaje personalizado para el estado de presencia
              rl.question("Mensaje personalizado: ", async (customMessage) => {
                const presence = xml(
                  'presence',
                  {},
                  xml('show', {}, presenceState),
                  xml('status', {}, customMessage)
                );
          
                // Enviar el mensaje de presencia al servidor XMPP
                await xmpp.send(presence);
          
                // Imprimiendo el mensaje de presencia con el usuario y la respuesta del servidor.
                console.log(`Mensaje de presencia enviado a ${username}: ${presence.toString()}`);
                mainMenu(); // Vuelve al menú principal después de completar la opción
              });
            });
            break;          
          // Enviando/recibiendo notificaciones (mensajes de chat)
          case "7":
            
            console.log("Leyendo las notificaciones")



            console.log("1. Ver mensajes recibidos")
            console.log("2. Ver invitaciones a chats grupales")
            console.log("3. Ver solicitudes de amistad")

            rl.question("¿Qué opción deseas?: ", async (answer) => {
              switch (answer) {
                case '1':
                  
                  for (const user in messagesDictionary) {
                    const userMessages = messagesDictionary[user];
                    console.log(`Usuario: ${user}`);
                    console.log(`  - ${userMessages}`);
                    console.log(); // Agregar una línea en blanco entre usuarios
                  }

                  mainMenu()

                  break;                
                case "2":

                  
                  gChat.forEach((chat) => {
                    console.log("Invitación a chat grupal recibida de: ", chat)
                  })
                  mainMenu()
                  break
                
                case "3": // Solicitudes de amistad.
                  soliAmi.forEach((invite) => {
                    console.log("Solicitud de amistad recibida de: ", invite)
                  })
                  mainMenu()
                  break


                default:
                  console.log("Opción inválida.")
                  mainMenu(); // Vuelve al menú principal en caso de opción inválida
              }})
            
            break;

          case "8":
            console.log("Eliminando cuenta...")
            // Lógica para la subopción 9.

            // Escribiendo la stanza para eliminar la cuenta.
            const stanza = xml(
              'iq',
              { type: 'set', id: 'unreg1' },
              xml(
                'query',
                { xmlns: 'jabber:iq:register' },
                xml('remove')
              )
            );

            // Enviando la stanza al servidor XMPP.
            xmpp.send(stanza);
            showMenu()
    
          case "9":
          
            console.log("Cerrando sesión...")
            
            xmpp.stop().catch(console.error);
              xmpp.on("offline", () => {
                console.log("offline");
                showMenu()
              });
            break;
          
          default:
            console.log("Opción inválida.")
            mainMenu(); // Vuelve al menú principal en caso de opción inválida
        }
      });
    };
    
    
    mainMenu();
    
  });

  xmpp.start().catch(console.error);
}

function register() {
  cliente.connect(5222, 'alumchat.lol', function() {
      //console.log('Conectado al servidor XMPP');
      cliente.write("<stream:stream to='alumchat.lol' xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams' version='1.0'>");
  });


  // Pidiendo al usuario los datos.
  rl.question("Usuario: ", (username) => {
    rl.question("Contraseña: ", (password) => {
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
              // Registro exitoso
              console.log('Registro exitoso');
              showMenu();
          } else if (data.toString().includes('<iq type="error"')) {
              // Error al registrar
              console.log('Error al registrar', data.toString());
          }
      });
    });
  });


  cliente.on('close', function() {
      console.log('Conexión cerrada');
  });
}


// Mostrar el menú inicial.
showMenu();