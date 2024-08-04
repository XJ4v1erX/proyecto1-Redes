import asyncio
import slixmpp
from slixmpp.exceptions import IqError, IqTimeout
from tkinter import messagebox
import threading
from ui.toast_view import show_toast

class AccountManager:
    def __init__(self):
        self.server = "alumchat.lol"
        self.port = 5222
        self.websocket_url = "ws://alumchat.lol:7070/ws/"

    def register_account(self, username, password):
        """Registrar una nueva cuenta en el servidor XMPP usando WebSocket."""
        if not self._validate_jid(username):
            show_toast("Invalid JID", "The username must be a valid JID, e.g., prueba@alumchat.lol")
            return False

        #messagebox.showinfo("Connecting", "Connecting to the server. Please wait...")

        client = XMPPRegister(username, password)
        connection_thread = threading.Thread(target=self._connect_and_process, args=(client,))
        connection_thread.start()

        return client.is_registered

    def login(self, username, password):
        """Iniciar sesión con una cuenta existente en el servidor XMPP usando WebSocket."""
        if not self._validate_jid(username):
            #messagebox.showerror("Invalid JID", "The username must be a valid JID, e.g., prueba@alumchat.lol")
            return False

        #messagebox.showinfo("Connecting", "Connecting to the server. Please wait...")

        client = XMPPClient(username, password)
        connection_thread = threading.Thread(target=self._connect_and_process, args=(client,))
        connection_thread.start()

        return client.is_logged_in

    def _connect_and_process(self, client):
        """Conectar al servidor y procesar la conexión en un hilo separado."""
        loop = asyncio.new_event_loop()  # Crear un nuevo bucle de eventos
        asyncio.set_event_loop(loop)
        try:
            loop.run_until_complete(client.connect(self.websocket_url))  # Conexión usando WebSocket
            loop.run_until_complete(client.process(forever=False))  # Procesar hasta desconexión
        except Exception as e:
            messagebox.showerror("Connection Error", f"Failed to connect to the server: {e}")
        finally:
            loop.close()  # Cerrar el bucle de eventos

    def _validate_jid(self, jid):
        """Verifica si el JID tiene un formato válido."""
        if "@" not in jid:
            return False
        return True


# Clase para registrar cuentas nuevas
class XMPPRegister(slixmpp.ClientXMPP):
    def __init__(self, jid, password):
        super().__init__(jid, password)
        self.is_registered = False

        # Conectar el evento de registro exitoso
        self.add_event_handler("register", self.register)

        # Manejar la señal de éxito o error en el registro
        self.add_event_handler("session_start", self.session_start)
        self.add_event_handler("failed_auth", self.failed_auth)

        # Manejar errores y desconexiones
        self.add_event_handler("disconnected", self.disconnected)
        self.add_event_handler("connection_failed", self.connection_failed)

    def session_start(self, event):
        try:
            self.send_presence()
            self.get_roster()

            self.is_registered = True
            messagebox.showinfo("Registration", "Account registered successfully!")
            self.disconnect()

        except IqError as e:
            messagebox.showerror("Registration Error", f"Error during registration: {e}")
            self.is_registered = False

        except IqTimeout:
            messagebox.showerror("Timeout Error", "Timeout while trying to register.")
            self.is_registered = False

    def failed_auth(self, event):
        """Manejar fallos en la autenticación."""
        messagebox.showerror("Registration Failed", "Registration failed due to incorrect credentials.")
        self.is_registered = False

    def register(self, iq):
        """Manejar el evento de registro."""
        try:
            self.disconnect()
        except IqError as e:
            messagebox.showerror("Registration Error", f"Registration error: {e}")
        except IqTimeout:
            messagebox.showerror("Timeout Error", "Timeout during registration.")

    def disconnected(self, event):
        """Manejar la desconexión del servidor."""
        messagebox.showwarning("Disconnected", "Disconnected from the server.")

    def connection_failed(self, event):
        """Manejar error de conexión."""
        messagebox.showerror("Connection Failed", "Failed to connect to the server.")


# Clase para iniciar sesión con una cuenta existente
class XMPPClient(slixmpp.ClientXMPP):
    def __init__(self, jid, password):
        super().__init__(jid, password)
        self.is_logged_in = False

        # Manejar el inicio de sesión exitoso
        self.add_event_handler("session_start", self.session_start)
        self.add_event_handler("failed_auth", self.failed_auth)

        # Manejar errores y desconexiones
        self.add_event_handler("disconnected", self.disconnected)
        self.add_event_handler("connection_failed", self.connection_failed)

    def session_start(self, event):
        """Acciones a realizar cuando el inicio de sesión es exitoso."""
        try:
            self.send_presence()
            self.get_roster()
            self.is_logged_in = True
            messagebox.showinfo("Login", "Logged in successfully!")
            self.disconnect()

        except IqError as e:
            messagebox.showerror("Login Error", f"Error during login: {e}")
            self.is_logged_in = False

        except IqTimeout:
            messagebox.showerror("Timeout Error", "Timeout during login.")
            self.is_logged_in = False

    def failed_auth(self, event):
        """Manejar el fallo en el inicio de sesión."""
        messagebox.showerror("Login Failed", "Login failed due to incorrect credentials.")
        self.is_logged_in = False

    def disconnected(self, event):
        """Manejar la desconexión del servidor."""
        messagebox.showwarning("Disconnected", "Disconnected from the server.")

    def connection_failed(self, event):
        """Manejar error de conexión."""
        messagebox.showerror("Connection Failed", "Failed to connect to the server.")
