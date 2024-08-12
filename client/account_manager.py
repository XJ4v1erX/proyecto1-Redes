import websockets
import asyncio

class XMPPAccountManager:
    def __init__(self, jid, password, websocket_uri="ws://alumchat.lol:7070/ws/"):
        self.jid = jid
        self.password = password
        self.websocket_uri = websocket_uri

    async def login(self):
        """ Inicia sesión usando WebSockets """
        try:
            async with websockets.connect(self.websocket_uri) as websocket:
                # Enviar las credenciales de inicio de sesión
                login_payload = f"<auth><jid>{self.jid}</jid><password>{self.password}</password></auth>"
                await websocket.send(login_payload)

                # Recibir la respuesta del servidor
                response = await websocket.recv()
                if "<success>" in response:
                    print(f"Login successful for {self.jid}")
                    return True
                else:
                    print(f"Login failed for {self.jid}")
                    return False
        except Exception as e:
            print(f"Error during WebSocket connection: {e}")
            return False

    async def register_account(self):
        """ Registrar una nueva cuenta en el servidor usando WebSockets """
        try:
            async with websockets.connect(self.websocket_uri) as websocket:
                # Enviar la solicitud de registro con los detalles de la cuenta
                register_payload = f"<register><jid>{self.jid}</jid><password>{self.password}</password></register>"
                await websocket.send(register_payload)

                # Recibir la respuesta del servidor
                response = await websocket.recv()
                if "<success>" in response:
                    print("Account registration successful.")
                    return True
                else:
                    print("Account registration failed.")
                    return False
        except Exception as e:
            print(f"Error during WebSocket connection: {e}")
            return False

    async def logout(self):
        """ Cerrar sesión usando WebSockets """
        try:
            async with websockets.connect(self.websocket_uri) as websocket:
                # Enviar la solicitud de cierre de sesión
                logout_payload = f"<logout><jid>{self.jid}</jid></logout>"
                await websocket.send(logout_payload)

                # Recibir la respuesta del servidor
                response = await websocket.recv()
                if "<success>" in response:
                    print("Logout successful.")
                    return True
                else:
                    print("Logout failed.")
                    return False
        except Exception as e:
            print(f"Error during WebSocket connection: {e}")
            return False
