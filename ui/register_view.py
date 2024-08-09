import tkinter as tk
from tkinter import ttk
from client.account_manager import XMPPAccountManager
import asyncio

class RegisterView:
    def __init__(self, root, on_register_success, on_back):
        self.root = root
        self.on_register_success = on_register_success
        self.on_back = on_back
        self.root.title("Register - XMPP Client")
        self.root.geometry("400x300")

        # Etiqueta de bienvenida
        self.label_title = tk.Label(self.root, text="Register a new account", font=("Arial", 14))
        self.label_title.pack(pady=20)

        # Campo para el JID (Usuario)
        self.jid_label = tk.Label(self.root, text="JID (e.g., username@jabber.de):")
        self.jid_label.pack(pady=5)
        self.jid_entry = tk.Entry(self.root)
        self.jid_entry.pack(pady=5)

        # Campo para la contraseña
        self.password_label = tk.Label(self.root, text="Password:")
        self.password_label.pack(pady=5)
        self.password_entry = tk.Entry(self.root, show="*")
        self.password_entry.pack(pady=5)

        # Botón de Registro
        self.register_button = ttk.Button(self.root, text="Register", command=self.register)
        self.register_button.pack(pady=20)

        # Botón de Volver
        self.back_button = ttk.Button(self.root, text="Back", command=self.go_back)
        self.back_button.pack(pady=10)

    async def async_register(self, jid, password):
        """ Ejecuta el registro de manera asíncrona usando WebSockets """
        account_manager = XMPPAccountManager(jid, password)
        success = await account_manager.register_account()
        if success:
            print("Registration successful!")
            self.on_register_success()  # Llama a la función para redirigir a la vista de login
        else:
            print("Registration failed.")

    def register(self):
        jid = self.jid_entry.get()
        password = self.password_entry.get()

        # Ejecuta el registro usando asyncio.run()
        asyncio.run(self.async_register(jid, password))

    def go_back(self):
        self.on_back()
