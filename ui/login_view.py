import tkinter as tk
from tkinter import ttk
from client.account_manager import XMPPAccountManager
import asyncio

class LoginView:
    def __init__(self, root, on_login_success, on_back):
        self.root = root
        self.on_login_success = on_login_success
        self.on_back = on_back
        self.root.title("Login - XMPP Client")
        self.root.geometry("400x300")

        # Etiqueta de bienvenida
        self.label_title = tk.Label(self.root, text="Login to your account", font=("Arial", 14))
        self.label_title.pack(pady=20)

        # Campo para el JID (Usuario)
        self.jid_label = tk.Label(self.root, text="JID:")
        self.jid_label.pack(pady=5)
        self.jid_entry = tk.Entry(self.root)
        self.jid_entry.pack(pady=5)

        # Campo para la contraseña
        self.password_label = tk.Label(self.root, text="Password:")
        self.password_label.pack(pady=5)
        self.password_entry = tk.Entry(self.root, show="*")
        self.password_entry.pack(pady=5)

        # Botón de Login
        self.login_button = ttk.Button(self.root, text="Login", command=self.login)
        self.login_button.pack(pady=20)

        # Botón de Volver
        self.back_button = ttk.Button(self.root, text="Back", command=self.go_back)
        self.back_button.pack(pady=10)

    async def async_login(self, jid, password):
        """ Ejecuta el login de manera asíncrona usando WebSockets """
        account_manager = XMPPAccountManager(jid, password)
        success = await account_manager.login()
        if success:
            self.on_login_success(jid)
        else:
            print("Login failed")

    def login(self):
        jid = self.jid_entry.get()
        password = self.password_entry.get()

        # Ejecuta el login usando asyncio.run()
        asyncio.run(self.async_login(jid, password))

    def go_back(self):
        self.on_back()
