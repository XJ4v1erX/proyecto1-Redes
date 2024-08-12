import slixmpp
import asyncio
import websockets

class XMPPClient(slixmpp.ClientXMPP):
    def __init__(self, jid, password):
        slixmpp.ClientXMPP.__init__(self, jid, password)
        self.add_event_handler("session_start", self.start)
        self.add_event_handler("register", self.register)

    async def start(self, event):
        self.send_presence()
        await self.get_roster()
        print("Login successful!")
        self.disconnect()

    async def register(self, iq):
        resp = self.Iq()
        resp['type'] = 'set'
        resp['register']['username'] = self.boundjid.user
        resp['register']['password'] = self.password
        try:
            await resp.send()
            print("Registration successful!")
            self.disconnect()
        except Exception as e:
            print(f"Registration failed: {e}")
            self.disconnect()

async def websocket_connect():
    try:
        async with websockets.connect('ws://alumchat.lol:7070/ws/') as websocket:
            print("Connected to WebSocket")
            # Puedes agregar más lógica aquí si es necesario.
    except websockets.exceptions.InvalidStatusCode as e:
        print(f"WebSocket connection failed with status code: {e.status_code}. The server may be down or unreachable.")
    except Exception as e:
        print(f"An error occurred: {e}")

async def run_xmpp_client(jid, password, register=False):
    xmpp = XMPPClient(jid, password)
    xmpp.connect(address=('alumchat.lol', 5222), disable_starttls=True)
    if register:
        xmpp.register_plugin('xep_0077')  # Soporte para registro de cuentas
        xmpp['xep_0077'].force_registration = True  # Forzar registro si no existe la cuenta
    await xmpp.process(forever=False)

if __name__ == "__main__":
    # Datos del usuario
    jid = input("JID (e.g., user@alumchat.lol): ")
    password = input("Password: ")
    register = input("Do you want to register? (yes/no): ").strip().lower() == 'yes'

    # Crear tareas para conectarse a WebSocket y ejecutar el cliente XMPP
    asyncio.run(websocket_connect())
    asyncio.run(run_xmpp_client(jid, password, register=register))
