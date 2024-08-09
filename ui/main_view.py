import tkinter as tk
from tkinter import ttk

class MainView:
    def __init__(self, root, on_login, on_register):
        self.root = root
        self.on_login = on_login
        self.on_register = on_register
        self.root.title("Welcome - XMPP Client")
        self.root.geometry("400x300")

        # Título
        self.label_title = tk.Label(self.root, text="Welcome to XMPP Client", font=("Arial", 16))
        self.label_title.pack(pady=20)

        # Botón de Login
        self.login_button = ttk.Button(self.root, text="Login", command=self.on_login)
        self.login_button.pack(pady=10)

        # Botón de Register
        self.register_button = ttk.Button(self.root, text="Register", command=self.on_register)
        self.register_button.pack(pady=10)

        # Botón de Exit
        self.exit_button = ttk.Button(self.root, text="Exit", command=self.exit_application)
        self.exit_button.pack(pady=10)

    def exit_application(self):
        self.root.quit()
